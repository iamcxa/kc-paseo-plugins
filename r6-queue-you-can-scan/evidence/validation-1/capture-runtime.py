#!/usr/bin/env python3
"""Cycle 8: both board views keep one unread FO question beside its gate; failed comms controls stay on the board. All executable paths are explicit; no live daemon is read or changed."""
import argparse
import json
import os
from pathlib import Path
import shutil
import signal
import socket
import subprocess
import tempfile
import time
import uuid


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("worktree", "paseo", "browser", "web-dist"):
        parser.add_argument("--" + name, type=Path, required=True)
    parser.add_argument("--port", type=int, default=7051)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--mode", choices=["empty", "gate"], default="empty")
    parser.add_argument("--baseline", help="Extract this revision into the disposable plugin for regression assertions")
    parser.add_argument("--long-feedback", action="store_true")
    parser.add_argument("--mutate-empty", action="store_true")
    parser.add_argument("--removed-workflow", action="store_true")
    parser.add_argument("--width", type=int, choices=[360,1440], required=True)
    args = parser.parse_args()
    args.mode = "gate"
    fo_title = "Queue proof FO"
    question = "Choose the release window (you)"
    worktree = args.worktree.resolve()
    dest = args.output.resolve()
    dest.mkdir(parents=True, exist_ok=False)
    head = subprocess.check_output(["git", "-C", str(worktree), "rev-parse", "HEAD"], text=True).strip()
    if args.port == 0:
        for _ in range(30):
            with socket.socket() as first, socket.socket() as second:
                first.bind(("127.0.0.1", 0))
                selected = first.getsockname()[1]
                if selected >= 65535 or selected in (6766, 6767, 6786, 6787) or 6859 <= selected <= 6935:
                    continue
                try:
                    second.bind(("127.0.0.1", selected + 1))
                except OSError:
                    continue
                args.port = selected
                break
        if args.port == 0:
            raise RuntimeError("No unused port pair found")
    ports = (args.port, args.port + 1)
    for port in ports:
        if port in (6767, 6787) or 6860 <= port <= 6935:
            parser.error("Use ports outside the live daemon range")
        with socket.socket() as probe:
            probe.bind(("127.0.0.1", port))
    root = Path(tempfile.mkdtemp(prefix=".closed-proof-", dir=worktree))
    session = "closed-proof-" + uuid.uuid4().hex[:10]
    daemon = None
    captured_pid = None
    env = {k: v for k, v in os.environ.items() if not k.startswith("PASEO_")}
    env.update(HOME=str(root / "home"), PASEO_HOME=str(root / "daemon"),
               PASEO_LISTEN=f"127.0.0.1:{args.port}", PASEO_RELAY_ENABLED="false",
               PASEO_WEB_UI_ENABLED="true", PASEO_WEB_UI_DIST_DIR=str(args.web_dist.resolve()),
               PASEO_SERVICE_PROXY_ENABLED="false", PATH=str(root / "bin") + ":" + os.environ["PATH"])

    def run(command, command_env=None, **kwargs):
        result = subprocess.run([str(s) for s in command], cwd=worktree, env=command_env or env,
                                check=False, capture_output=True, text=True, timeout=90, **kwargs)
        if result.returncode:
            raise RuntimeError(result.stderr.strip() or result.stdout.strip())
        return result.stdout.strip()

    config = root / "browser.json"

    def browser(*command):
        return run([args.browser, "--session", session, "--config", config, *command],
                   command_env=dict(env, HOME=os.environ["HOME"]))

    def evaluate(code):
        return json.loads(browser("eval", code))

    def wait_for(predicate):
        deadline = time.monotonic() + 45
        while time.monotonic() < deadline:
            if predicate():
                return
            time.sleep(0.2)
        raise TimeoutError("Isolated proof did not become ready")

    def element(prefix, role="button"):
        return (f'Array.from(document.querySelectorAll("[role={role}]"))'
                f'.filter(e=>e.checkVisibility()).find(e=>e.textContent.trim().startsWith({json.dumps(prefix)}))')

    def point(prefix, role="button"):
        return evaluate(f"(()=>{{const r={element(prefix, role)}.getBoundingClientRect();"
                        "return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()")

    def click(prefix, role="button"):
        pos = point(prefix, role)
        browser("mouse", "move", pos["x"], pos["y"])
        browser("mouse", "down")
        browser("wait", 250)
        browser("mouse", "up")

    def shot(name):
        browser("screenshot", dest / name)

    try:
        for directory in ("home", "daemon/agents", "bin", "workflow/.spacedock-state"):
            (root / directory).mkdir(parents=True, exist_ok=True)
        plugin = root / "plugin"
        shutil.copytree(worktree / "spacedock-bridge", plugin, ignore=shutil.ignore_patterns("node_modules"))
        if args.baseline:
            tracked = run(["git", "-C", worktree, "ls-tree", "-r", "--name-only", args.baseline, "spacedock-bridge/"]).splitlines()
            for path in tracked:
                relative = Path(path).relative_to("spacedock-bridge")
                (plugin / relative).parent.mkdir(parents=True, exist_ok=True)
                data = subprocess.check_output(["git", "-C", str(worktree), "show", args.baseline + ":" + path])
                (plugin / relative).write_bytes(data)
        (plugin / "node_modules").symlink_to(worktree / "spacedock-bridge/node_modules", target_is_directory=True)
        fleet = plugin / "server/fleet-mcp.ts"
        original = fleet.read_text()
        assert "const PORT = 6787;" in original, "Fleet fixture needs updating"
        fleet.write_text(original.replace("const PORT = 6787;", f"const PORT = {ports[1]};"))
        (root / "daemon/config.json").write_text(json.dumps({"pluginsEnabled": True}))
        (root / "workflow/README.md").write_text("---\ncommissioned-by: spacedock@0.27.3\nstate: .spacedock-state\n---\n")
        co_id = str(uuid.uuid4())
        agents = [(co_id, "Comms officer", {"role": "comms-officer"})]
        if args.mode == "gate":
            agents.append((str(uuid.uuid4()), fo_title, {"role": "fo", "repo": "bridge", "task": "adapter-proof", "workflow-dir": str(root / "workflow")}))
        if args.removed_workflow:
            removed = root / "removed-workflow"
            removed.mkdir()
            (removed / "README.md").write_text("---\ncommissioned-by: spacedock@0.27.3\n---\n")
            shutil.rmtree(removed)
            agents.append((str(uuid.uuid4()), "Removed workflow FO", {"role": "fo", "repo": "removed", "task": "missing", "workflow-dir": str(removed)}))
        for agent_id, title, labels in agents:
            (root / f"daemon/agents/{agent_id}.json").write_text(json.dumps(dict(
                id=agent_id, title=title, provider="codex", cwd=str(root / "home"), labels=labels,
                createdAt="2026-10-25T00:00:00Z", updatedAt="2026-10-25T00:00:00Z", lastStatus="idle", config=None)))
        gates = []
        if args.mode == "gate":
            for slug in ("adapter-proof",):
                gates.append(dict(slug=slug, title="Approve " + slug.replace("-", " ") + " and confirm the full proposal before release", status="validation", **{"gate-readiness": "awaiting-captain"}))
                resolution = "\n          resolution:\n            decision: approve\n            reason: Synthetic recorded approval\n            at: '2026-10-25T00:00:00Z'" if slug == "adapter-proof" else "\n          withdrawal:\n            reason: Synthetic withdrawal"
                if args.long_feedback and slug == "adapter-proof":
                    reason = "\n".join(f"              Feedback line {line}: synthetic recorded reason" for line in range(1, 41))
                    resolution = resolution.replace("            reason: Synthetic recorded approval", "            reason: |\n" + reason)
                (root / f"workflow/.spacedock-state/{slug}.md").write_text(
                    "---\ngates:\n  records:\n    - stage: validation\n      attempts:\n        - briefing:\n            id: proof:" + slug + resolution + "\n---\n")
        fixture = root / "gates.json"
        fixture.write_text(json.dumps({"entities": gates}))
        stub = root / "bin/spacedock"
        stub.write_text("#!/usr/bin/env python3\nfrom pathlib import Path\nprint(Path(" + repr(str(fixture)) + ").read_text())\n")
        stub.chmod(0o755)
        stub = root / "bin/gh"
        stub.write_text("#!/usr/bin/env python3\nprint('[]')\n")
        stub.chmod(0o755)
        store = root / "home/.local/share/paseo-fo-coordinator"
        store.mkdir(parents=True)
        (store / "reviews.json").write_text(json.dumps(dict(requests=[], seen={}, checkedAt=int(time.time()*1000), error=None)))
        if args.mutate_empty:
            board = plugin / "client/board.tsx"
            before = board.read_text()
            target = '{notice ? <Text style={styles.muted}>{notice}</Text> : null}'
            assert before.count(target) == 1
            board.write_text(before.replace(target, '{queue.length === 0 && !coAsk ? <Text style={styles.muted}>Nothing is waiting on you.</Text> : null}'))
        # Fixture-only SDK boundaries supply an unread, unlabelled FO reply and a controllable comms failure.
        # Product modules, including useCoAsk and Board, are copied unchanged.
        entry = plugin / "index.client.tsx"
        fo_id, _, fo_labels = agents[1]
        fo_fixture = dict(id=fo_id, title=fo_title, cwd=str(root/'home'), status='idle', updatedAt='2026-10-27T00:00:00Z', attentionTimestamp='2026-10-27T00:00:00Z', requiresAttention=True, attentionReason='finished', labels=fo_labels)
        wrapper = '\nimport { usePaseo } from "@getpaseo/plugin/client";\nfunction ProofBridge(props: BoardProps) {\n  const paseo = usePaseo();\n  const proof = globalThis as any;\n  if (!proof.__truthProof) {\n    const fo = FO_FIXTURE;\n    const originalList = paseo.agents.list.bind(paseo.agents);\n    paseo.agents.list = (async (options:any) => {\n      if (options?.filter?.labels?.role !== "fo") return originalList(options);\n      return {entries:[{agent:fo}],subscription:{\n        subscribe:(handlers:any) => handlers.snapshot?.({entries:[{agent:fo}]}),\n        release:async () => {},\n      }};\n    }) as typeof paseo.agents.list;\n    let fail = false; let holdReady = false; let releaseReady: (() => void) | undefined;\n    const listeners = new Set<any>();\n    const stats = {foRead:0,commsRead:0,subscribe:0,release:0};\n    const original = paseo.agents.ref.bind(paseo.agents);\n    paseo.agents.ref = ((id: string) => {\n      const handle = original(id);\n      if (id === fo.id) return new Proxy(handle, {get(target,key) {\n        if (key === "timeline") return {refetch:async () => {\n          stats.foRead++;\n          return {entries:[{seqStart:1,timestamp:fo.updatedAt,item:{type:"assistant_message",text:"The two release windows are ready.\\nNext: Choose the release window (you)"}}]};\n        }};\n        return Reflect.get(target,key);\n      }});\n      if (id !== CO_ID) return handle;\n      return new Proxy(handle, {get(target,key) {\n        if (key === "status") return "idle";\n        if (key === "subscribe") return () => () => {};\n        if (key === "timeline") return {\n          refetch: async () => {\n            stats.commsRead++;\n            if (fail) throw Error("Synthetic timeline failure");\n            return {entries:[]};\n          },\n          subscribe: (listener:any) => {\n            stats.subscribe++;listeners.add(listener);\n            const stop:any = () => {stats.release++;listeners.delete(listener)};\n            stop.ready=holdReady ? new Promise<void>((resolve)=>{releaseReady=resolve}) : Promise.resolve();return stop;\n          },\n        };\n        return Reflect.get(target,key);\n      }});\n    }) as typeof paseo.agents.ref;\n    proof.__truthProof = {\n      stats,\n      prepareRetry: (continued:boolean) => {fail=continued;holdReady=true;},\n      releaseRetry: () => {holdReady=false;releaseReady?.();},\n      error: () => {fail=true;for(const l of listeners)l({event:{type:"error",error:"Synthetic timeline failure"}})},\n    };\n  }\n  return <Bridge {...props} />;\n}\n'.replace('FO_FIXTURE', json.dumps(fo_fixture)).replace('CO_ID', json.dumps(co_id))
        entry.write_text(entry.read_text().replace('<Bridge {...props} />', '<ProofBridge {...props} />') + wrapper)
        config.write_text(json.dumps(dict(profile=str(root / "browser-profile"), plugins=[], colorScheme="dark",
                                          args="--host-resolver-rules=MAP localhost ~NOTFOUND")))
        with (root / "daemon.log").open("w") as log:
            daemon = subprocess.Popen([str(args.paseo), "daemon", "run", "--home", str(root / "daemon")],
                                      cwd=worktree, env=env, stdout=log, stderr=log, start_new_session=True)
        wait_for(lambda: (root / "daemon/paseo.pid").exists())
        captured_pid = json.loads((root / "daemon/paseo.pid").read_text())["pid"]
        run([args.paseo, "plugin", "install", plugin, "--home", root / "daemon", "--json"], input="y\n")
        browser("open", f"http://127.0.0.1:{args.port}")
        browser("set", "viewport", 1440, 1000)
        wait_for(lambda: evaluate('document.body.innerText.includes("Direct connection")'))
        browser("find", "text", "Direct connection", "click")
        browser("fill", '[aria-label="Host"]', "127.0.0.1")
        browser("fill", '[aria-label="Port"]', args.port)
        click("Connect")
        wait_for(lambda: evaluate(f"Boolean({element('Bridge')})"))
        click("Bridge")
        wait_for(lambda: evaluate("Boolean(globalThis.__truthProof)"))
        browser("set", "viewport", args.width, 1000 if args.width == 1440 else 780)
        browser("wait", 800)
        menu = 'document.querySelector(' + json.dumps('[aria-label="Open menu"]') + ')'
        if evaluate(f"Boolean({menu})"):
            evaluate(menu + ".click()")
            wait_for(lambda: evaluate(f"Boolean({element('Bridge')})"))
            evaluate(f"{element('Bridge')}.click()")
            evaluate('document.querySelector(' + json.dumps('[aria-label="Close menu"]') + ')?.click()')
        browser("wait", 500)
        # Dismiss the observed compact drawer with a real pointer click on its close control.
        if evaluate('Boolean(Array.from(document.querySelectorAll("button,[role=button]")).find(e=>e.checkVisibility() && /Close menu|Close sidebar/.test(e.getAttribute("aria-label")||"")))'):
            pos = evaluate('(()=>{const e=Array.from(document.querySelectorAll("button,[role=button]")).find(e=>e.checkVisibility() && /Close menu|Close sidebar/.test(e.getAttribute("aria-label")||""));const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()')
            browser("mouse", "move", pos["x"], pos["y"])
            browser("mouse", "down")
            browser("mouse", "up")
            browser("wait", 500)
        wait_for(lambda: evaluate(f"Boolean({element('FOs' if args.width == 360 else 'By decision', 'tab')})"))
        def has(text):
            return evaluate('document.body.innerText.includes(' + json.dumps(text) + ')')
        wait_for(lambda: has("By decision · 2"))
        title = "Approve adapter proof and confirm the full proposal before release"
        observed = dict(candidate=args.baseline or head, synthetic=True, width=args.width, fixture=dict(unlabelledUnread=True,gateCount=1,reviewCount=0), checks=[])
        def click(prefix, role="button"):
            evaluate(f"{element(prefix, role)}.click()")
        def visible_title_count(text):
            return evaluate("Array.from(document.querySelectorAll('div')).filter(e=>e.checkVisibility()&&e.childElementCount===0&&e.textContent==="+json.dumps(text)+").length")
        def check_rows(view):
            assert has("By decision · 2"), "decision count must include gate and question"
            assert visible_title_count(title) == 1, "gate must stay visible"
            assert visible_title_count(question) == 1, "question preview must stay visible exactly once"
            assert not has("Has a question for you"), "generic title hides the request"
            assert not has("← Queue"), "capture must show the board, not an opened card"
            if view == "FO":
                assert has("2 waiting"), "FO count must include gate and question"
                rows = evaluate('Array.from(document.querySelectorAll("[aria-label]")).filter(e=>e.checkVisibility()&&e.getAttribute("aria-label").endsWith("— Queue proof FO")).length')
                assert rows == 2, rows
            overflow = evaluate('document.documentElement.scrollWidth>innerWidth')
            assert not overflow, "horizontal overflow"
            return dict(view=view,question=question,questionOccurrences=1,gate=title,waitingRows=2,onBoard=True,horizontalOverflow=overflow)
        for view in ("decision", "FO"):
            click("By " + view, "tab")
            browser("wait", 200)
            observed["checks"].append(check_rows(view))
            shot(str(args.width)+"-by-"+view.lower()+".png")
            (dest / ("snapshot-"+view.lower()+".txt")).write_text(browser("snapshot", "-i"))
        evaluate('globalThis.__truthProof.error()')
        wait_for(lambda: has("Check again · comms officer"))
        for view in ("decision", "FO"):
            click("By " + view, "tab")
            browser("wait", 200)
            check = check_rows(view)
            retry = evaluate('Array.from(document.querySelectorAll("[aria-label]")).filter(e=>e.checkVisibility()&&e.getAttribute("aria-label")==="Check comms officer again").length')
            assert retry == 1, "failed source retry control must be visible on the board"
            check["failedSource"] = "comms officer"
            check["checkAgainVisible"] = True
            observed["checks"].append(check)
            shot(str(args.width)+"-failed-by-"+view.lower()+".png")
            (dest / ("snapshot-failed-"+view.lower()+".txt")).write_text(browser("snapshot", "-i"))
        observed["retry"] = []
        for continued in (False, True):
            if continued:
                evaluate('globalThis.__truthProof.error()')
                wait_for(lambda: has("Check again · comms officer"))
            evaluate('globalThis.__truthProof.prepareRetry(' + str(continued).lower() + ')')
            click("Check again · comms officer")
            wait_for(lambda: has("Loading…") and not has("Check again · comms officer"))
            shot("retry-pending-" + str(continued).lower() + ".png")
            (dest / ("pending-" + str(continued).lower() + ".txt")).write_text(browser("snapshot", "-i"))
            evaluate('globalThis.__truthProof.releaseRetry()')
            if continued:
                wait_for(lambda: has("Check again · comms officer"))
            else:
                wait_for(lambda: has("By decision · 2") and not has("Could not check") and not has("Loading…"))
            shot("retry-result-" + str(continued).lower() + ".png")
            observed["retry"].append(dict(pendingObserved=True, outcome="failed" if continued else "loaded", stats=evaluate('globalThis.__truthProof.stats')))
        (store / "reviews.json").write_text(json.dumps(dict(requests=[], seen={}, checkedAt=int(time.time()*1000), error="Synthetic review source failure")))
        stub = root / "bin/gh"
        stub.write_text("#!/usr/bin/env python3\nraise SystemExit(1)\n")
        click("Comms officer", "tab")
        click("FOs", "tab")
        wait_for(lambda: has("Next automatic review check:"))
        assert not has("Next automatic review check: unknown"), "existing poller must supply a real next check"
        observed["reviewSchedule"] = evaluate('document.body.innerText.split("\\n").find(l=>l.includes("Next automatic review check:"))')
        shot("review-next-check.png")
        (dest / "review-snapshot.txt").write_text(browser("snapshot", "-i"))
        observed["stats"] = evaluate('globalThis.__truthProof.stats')
        (dest / "observed.json").write_text(json.dumps(observed, indent=2)+"\n")
        print("PASS: isolated retry pending/loaded/failed and actual review next-check at " + str(args.width))
    except Exception:
        try:
            shot("failure.png")
            (dest / "failure-snapshot.txt").write_text(browser("snapshot", "-i"))
        except Exception:
            pass
        raise
    finally:
        try:
            browser("close")
        except (subprocess.SubprocessError, OSError):
            pass
        if captured_pid:
            try:
                os.kill(captured_pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
        if daemon:
            try:
                daemon.wait(timeout=15)
            except subprocess.TimeoutExpired:
                daemon.terminate()
                daemon.wait(timeout=10)
        if captured_pid:
            try:
                os.kill(captured_pid, 0)
            except ProcessLookupError:
                pass
            else:
                raise RuntimeError("Isolated daemon still alive; retained proof home")
        if (root / "daemon.log").exists():
            # Keep only named gate events, never provider command lines.
            (dest / "gate-events.log").write_text("\n".join(l for l in (root / "daemon.log").read_text().splitlines() if 'gates.read #' in l) + "\n")
        shutil.rmtree(root)
        (dest / "cleanup.json").write_text(json.dumps({"captured_daemon_pid": captured_pid, "isolated_root": str(root), "home_removed": not root.exists(), "ports": ports, "browser_closed": True}, indent=2) + "\n")


if __name__ == "__main__":
    main()
