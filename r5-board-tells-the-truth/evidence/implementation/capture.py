#!/usr/bin/env python3
"""Exercise board loading, failure, compact question detection and closed gates in an isolated daemon."""
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
    parser.add_argument("--baseline", help="Extract this revision into the disposable plugin and expect draft loss")
    parser.add_argument("--mutate-empty", action="store_true")
    args = parser.parse_args()
    fo_title = "Truth proof FO"
    worktree = args.worktree.resolve()
    dest = args.output.resolve()
    dest.mkdir(parents=True, exist_ok=False)
    head = subprocess.check_output(["git", "-C", str(worktree), "rev-parse", "HEAD"], text=True).strip()
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

    def sample(prefix, role="button"):
        def read():
            return evaluate(f"(()=>{{const s=getComputedStyle({element(prefix, role)});"
                            "return {background:s.backgroundColor,opacity:s.opacity}})()")
        browser("mouse", "move", 700, 100)
        normal = read()
        pos = point(prefix, role)
        browser("mouse", "move", pos["x"], pos["y"])
        browser("wait", 100)
        hover = read()
        browser("mouse", "down")
        try:
            browser("wait", 250)
            pressed = read()
        finally:
            browser("mouse", "move", 700, 100)
            browser("mouse", "up")
        assert normal["background"] != hover["background"], prefix + " has no hover change"
        assert pressed["opacity"] == "0.65", prefix + " has no pressed change"
        return dict(label=prefix, role=role, normal=normal, hover=hover, pressed=pressed)

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
        for agent_id, title, labels in agents:
            (root / f"daemon/agents/{agent_id}.json").write_text(json.dumps(dict(
                id=agent_id, title=title, provider="codex", cwd=str(root / "home"), labels=labels,
                createdAt="2026-10-25T00:00:00Z", updatedAt="2026-10-25T00:00:00Z", lastStatus="idle", config=None)))
        gates = []
        if args.mode == "gate":
            for slug in ("adapter-proof", "hover-proof"):
                gates.append(dict(slug=slug, title="Approve " + slug.replace("-", " "), status="validation", **{"gate-readiness": "awaiting-captain"}))
                resolution = "\n          resolution:\n            decision: approve\n            reason: Synthetic recorded approval\n            at: '2026-10-25T00:00:00Z'" if slug == "adapter-proof" else "\n          withdrawal:\n            reason: Synthetic withdrawal"
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
        def review_store(error=None, checked=1792886400000):
            (store / "reviews.json").write_text(json.dumps(dict(requests=[], seen={}, checkedAt=checked, error=error)))
        review_store(checked=None if args.mode == "empty" else 1792886400000)
        if args.mutate_empty:
            board = plugin / "client/board.tsx"
            board.write_text(board.read_text().replace('{empty.message ? <Text style={styles.muted}>{empty.message}</Text> : null}', '{queue.length === 0 && !coAsk ? <Text style={styles.muted}>Nothing is waiting on you.</Text> : null}'))
        # This wrapper controls only the synthetic coordinator's SDK timeline boundary.
        # Product modules, including useCoAsk and Board, are copied unchanged.
        entry = plugin / "index.client.tsx"
        wrapper = '''
import { usePaseo } from "@getpaseo/plugin/client";
function ProofBridge(props: BoardProps) {
  const paseo = usePaseo();
  const proof = globalThis as any;
  if (!proof.__truthProof) {
    let text = "";
    let fail = false;
    let working = false;
    const listeners = new Set<any>();
    const stats = {refetch:0,subscribe:0,release:0};
    const original = paseo.agents.ref.bind(paseo.agents);
    paseo.agents.ref = ((id: string) => {
      const handle = original(id);
      if (id !== CO_ID) return handle;
      return new Proxy(handle, {get(target, key) {
        if (key === "status") return working ? "running" : "idle";
        if (key === "subscribe") return () => () => {};
        if (key === "timeline") return {
          refetch: async () => {
            stats.refetch++;
            if (fail) throw Error("Synthetic timeline failure");
            return {entries: text ? [{seqStart:1,item:{type:"assistant_message",text}}] : []};
          },
          subscribe: (listener:any) => {
            stats.subscribe++;listeners.add(listener);
            const stop:any = () => {stats.release++;listeners.delete(listener)};
            stop.ready=Promise.resolve();return stop;
          },
        };
        return Reflect.get(target,key);
      }});
    }) as typeof paseo.agents.ref;
    proof.__truthProof = {
      stats,
      question: (value:string) => {text=value;working=false;fail=false;for(const l of listeners)l({event:{type:"turn_completed"}})},
      start: () => {working=true;for(const l of listeners)l({event:{type:"turn_started"}})},
      error: () => {fail=true;for(const l of listeners)l({event:{type:"error",error:"Synthetic timeline failure"}})},
    };
  }
  return <Bridge {...props} />;
}
'''.replace("CO_ID", json.dumps(co_id))
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
        browser("set", "viewport", 380, 820)
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
        wait_for(lambda: evaluate(f"Boolean({element('FOs', 'tab')})"))
        def has(text):
            return evaluate('document.body.innerText.includes(' + json.dumps(text) + ')')
        def tab_back():
            click("Comms officer", "tab")
            click("FOs", "tab")
        observed = dict(candidate=head, baseline=args.baseline, synthetic=True, mode=args.mode)
        if args.mode == "empty":
            wait_for(lambda: has("By decision"))
            if args.baseline:
                wait_for(lambda: has("Nothing is waiting on you."))
                observed["false_empty_before_review_check"] = has("By decision · 0")
                assert observed["false_empty_before_review_check"]
                shot("baseline-false-empty.png")
            else:
                wait_for(lambda: has("By decision · …"))
                assert has("Loading…"), "Loading source was rendered as a false empty list"
                assert not has("Nothing is waiting on you.")
                shot("loading-380.png")
                review_store(error="Synthetic review read failure")
                tab_back()
                wait_for(lambda: has("Could not check reviews") and has("By decision · ?"))
                assert not has("Nothing is waiting on you.")
                shot("reviews-failed-380.png")
                review_store()
                tab_back()
                wait_for(lambda: has("Nothing is waiting on you.") and has("By decision · 0"))
                shot("checked-empty-380.png")
                assert not evaluate('Boolean(document.querySelector("textarea"))'), "Comms chat mounted on FOs tab"
                evaluate('globalThis.__truthProof.question("Choose the next step.\\nNext: Choose the theme (you)")')
                wait_for(lambda: has("Choose the theme (you)") and has("By decision · 1"))
                assert not evaluate('Boolean(document.querySelector("textarea"))')
                shot("question-on-fos-380.png")
                observed["question_on_fos_without_chat"] = True
                evaluate('globalThis.__truthProof.start()')
                wait_for(lambda: not has("Choose the theme (you)"))
                evaluate('globalThis.__truthProof.error()')
                wait_for(lambda: has("Could not check the comms officer"))
                evaluate('globalThis.__truthProof.question("")')
                wait_for(lambda: has("Nothing is waiting on you.") and has("By decision · 0"))
                observed["timeline_failure_clears_on_success"] = True
                observed["timeline_stats"] = evaluate('globalThis.__truthProof.stats')
        else:
            wait_for(lambda: has("Approve adapter proof"))
            click("NEXT")
            wait_for(lambda: has("Recorded: approve") if not args.baseline else has("Briefing error"))
            shot("recorded-gate-380.png")
            if not args.baseline:
                assert not has("Briefing error")
                assert has("← Queue")
                def gate_calls():
                    import re
                    return len(re.findall(r'gates.read #[0-9]+ start', (root / "daemon.log").read_text()))
                before = gate_calls()
                # The gate source still has its old server snapshot; return must bypass it.
                fixture.write_text(json.dumps({"entities": [gates[1]]}))
                click("← Queue")
                wait_for(lambda: has("Approve hover proof") and not has("Approve adapter proof"))
                observed["refresh_calls_on_return"] = gate_calls() - before
                assert observed["refresh_calls_on_return"] == 1, observed
                click("NEXT")
                wait_for(lambda: has("This gate is no longer open."))
                assert not has("Briefing error") and not has("Recorded: approve")
                shot("neutral-closed-gate-380.png")
                before = gate_calls()
                click("← Queue")
                browser("wait", 500)
                assert gate_calls() == before, "Neutral close unexpectedly refreshed"
                observed["neutral_close_no_refresh"] = True
        (dest / "snapshot.txt").write_text(browser("snapshot", "-i"))
        (dest / "observed.json").write_text(json.dumps(observed, indent=2) + "\n")
        print("PASS: " + args.mode + (" baseline reproduction" if args.baseline else " runtime assertions"))
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
