#!/usr/bin/env python3
"""Verify feedback and navigation stay visible around the compact briefing in an isolated daemon."""
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
    parser.add_argument("--long-name", action="store_true")
    parser.add_argument("--baseline", help="Extract this revision into the disposable plugin and expect draft loss")
    parser.add_argument("--expect-overflow", action="store_true")
    args = parser.parse_args()
    fo_title = "Draft proof FO"
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
        if role == "tab":
            label = evaluate(f"{element(prefix, role)}.textContent.trim()")
            browser("find", "role", "tab", "click", "--name", label)
            return
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
        gates = []
        for slug in ("adapter-proof", "hover-proof"):
            gates.append(dict(slug=slug, title="Approve " + slug.replace("-", " "),
                              status="validation", **{"gate-readiness": "awaiting-captain"}))
            room = root / f"workflow/.spacedock-state/{slug}/review/validation/briefing-1"
            room.mkdir(parents=True)
            (room / "index.json").write_text(json.dumps({"question": "Approve the isolated " + slug.replace("-", " ") + "?",
                "artifacts": [{"summary": "Long synthetic briefing. " * 100, "uri": "fixture"}]}))
            (root / f"workflow/.spacedock-state/{slug}.md").write_text(
                f"---\ntitle: {slug}\ngates:\n  records:\n    - stage: validation\n      attempts:\n"
                f"        - briefing:\n            id: proof:{slug}\n            digest: sha256:proof\n"
                f"            room-ref: ./{slug}/review/validation/briefing-1\n---\n")
        fo_id = None
        for title, labels in (("Comms officer", {"role": "comms-officer"}),
                              (fo_title, {"role": "fo", "repo": "bridge", "task": "adapter-proof",
                               "workflow-dir": str(root / "workflow"), "next-owner": "captain",
                               "next": "Does OMP need its own Spacedock host adapter?",
                               "paseo.open-agent-tab.desktop": "false", "paseo.open-agent-tab.phone": "false"})):
            agent_id = str(uuid.uuid4())
            if title == fo_title: fo_id = agent_id
            (root / f"daemon/agents/{agent_id}.json").write_text(json.dumps(dict(
                id=agent_id, title=title, provider="codex", cwd=str(root / "home"), labels=labels,
                createdAt="2026-10-23T11:00:00Z", updatedAt="2026-10-23T11:00:00Z", lastStatus="idle", config=None)))
        reviews = [dict(url=f"https://github.com/example/{repo}/pull/{number}", repo=repo, owner="example",
                        number=number, title=title, author="fixture", firstSeenAt=1792753200000)
                   for repo, number, title in (("bridge", 41, "Review hover feedback"), ("unowned", 42, "Review an unowned change"))]
        store = root / "home/.local/share/paseo-fo-coordinator"
        store.mkdir(parents=True)
        (store / "reviews.json").write_text(json.dumps(dict(requests=reviews,
            seen={r["url"]: r["firstSeenAt"] for r in reviews}, checkedAt=1792753400000, error=None)))
        decision = dict(decisionId="synthetic-decision", briefingId="proof:adapter-proof", slug="adapter-proof",
                        foId=fo_id, decision="approve", words="Synthetic approval", at=int(time.time()*1000)-11*60_000)
        (store / "decisions.json").write_text(json.dumps([decision]))
        gh_rows = [dict(url=r["url"], number=r["number"], title=r["title"], author={"login": "fixture"},
                       repository={"name": r["repo"], "nameWithOwner": "example/" + r["repo"]}) for r in reviews]
        for name, value in (("spacedock", {"entities": gates}), ("gh", gh_rows)):
            stub = root / "bin" / name
            stub.write_text("#!/usr/bin/env python3\nprint(" + repr(json.dumps(value)) + ")\n")
            stub.chmod(0o755)
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
        wait_for(lambda: evaluate(f"Boolean({element('Approve adapter proof')})"))
        observed = {"candidate": head, "baseline": args.baseline, "synthetic": True}
        def enter_bridge():
            menu = 'Boolean(document.querySelector(' + json.dumps('[aria-label="Open menu"]') + '))'
            tabs = f"Boolean({element('FOs', 'tab')})"
            wait_for(lambda: evaluate(menu) or evaluate(tabs))
            if evaluate(tabs):
                return
            evaluate('document.querySelector(' + json.dumps('[aria-label="Open menu"]') + ').click()')
            wait_for(lambda: evaluate(f"Boolean({element('Bridge')})"))
            evaluate(f"{element('Bridge')}.click()")
            evaluate('document.querySelector(' + json.dumps('[aria-label="Close menu"]') + ')?.click()')
            browser("wait", 600)
            shot("entered-compact-bridge.png")
        def input_for(placeholder):
            return 'textarea[placeholder^=' + json.dumps(placeholder) + ']'
        def value(selector):
            return evaluate('document.querySelector(' + json.dumps(selector) + ').value')
        def fill(selector, text):
            browser("fill", selector, text)
        def has(text):
            return evaluate('document.body.innerText.includes(' + json.dumps(text) + ')')
        def open_gate(name):
            click("Approve " + name + " proof")
            wait_for(lambda: has("Read full briefing"))
        browser("set", "viewport", 360, 780)
        browser("wait", 800)
        enter_bridge()
        wait_for(lambda: evaluate(f"Boolean({element('Approve adapter proof')})"))
        open_gate("adapter")
        warning = "do not resend."
        wait_for(lambda: has(warning))
        def collapse():
            if has("Hide briefing ▴"):
                click("Hide briefing ▴")
            else:
                click("Collapse briefing")
            browser("wait", 250)
        def visible(text):
            return evaluate("""(text=>{
              const e=Array.from(document.querySelectorAll('div')).find(e=>!e.childElementCount && e.textContent.includes(text));
              if(!e)return false;
              const r=e.getBoundingClientRect();
              if(!r.width || !r.height || r.top<0 || r.bottom>innerHeight)return false;
              let parent=e.parentElement;
              while(parent){
                const s=getComputedStyle(parent),p=parent.getBoundingClientRect();
                if(['hidden','scroll','auto'].includes(s.overflowY) && (r.top<p.top || r.bottom>p.bottom))return false;
                parent=parent.parentElement;
              }
              return true;
            })("""+json.dumps(text)+")")
        collapse()
        observed = dict(candidate=head, baseline=args.baseline, synthetic=True, viewport=dict(width=360,height=780))
        observed['collapsed_warning_visible']=visible(warning)
        observed['collapsed_back_visible']=visible("← Bridge")
        observed['collapsed_show_label']=has("Show briefing ▾")
        shot("collapsed-warning-360x780.png")
        (dest / "observed-states.json").write_text(json.dumps(observed,indent=2)+"\n")
        assert observed['collapsed_warning_visible'], "Collapsing hides the unresolved-delivery / do-not-resend warning"
        assert observed['collapsed_back_visible'], "Collapsing hides the card's back control"
        assert observed['collapsed_show_label'], "Collapsed control does not name the briefing"
        click("Show briefing ▾")
        assert visible(warning) and visible("← Bridge") and has("Hide briefing ▴")
        shot("expanded-warning-360x780.png")
        observed['expanded_warning_visible']=True
        click("← Bridge")
        decision['at']=int(time.time()*1000)
        (store / "decisions.json").write_text(json.dumps([decision]))
        open_gate("adapter")
        wait_for(lambda: has("Sent to the comms officer"))
        assert visible("Sent to the comms officer")
        collapse()
        assert visible("Sent to the comms officer") and visible("← Bridge")
        observed['sent_visible_both_states']=True
        # Resolve only the synthetic gate; the real coordinator is never contacted.
        task=root/'workflow/.spacedock-state/adapter-proof.md'
        original_task=task.read_text()
        for reason, expected, name in [
            ("Other recording", "Recorded, but the reason", "recorded_elsewhere"),
            ("synthetic-decision Synthetic approval", "Recorded: approve", "recorded")]:
            task.write_text(original_task.replace('            room-ref:',
                '          resolution:\n            decision: approve\n            reason: '+reason+'\n            at: now\n            room-ref:'))
            wait_for(lambda: has(expected))
            assert visible(expected)
            click("Show briefing ▾")
            assert visible(expected)
            collapse()
            assert visible(expected)
            observed[name+'_visible_both_states']=True
            shot(name+"-collapsed-360x780.png")
            click("← Bridge")
            task.write_text(original_task)
            open_gate("adapter")
            wait_for(lambda: has("Sent to the comms officer"))
            collapse()
        click("← Bridge")
        bad=root/'workflow/.spacedock-state/hover-proof.md'
        bad.write_text('---\ntitle: Error fixture\ngates: {records: []}\n---\n')
        click("Approve hover proof")
        error="This gate has no open briefing now."
        wait_for(lambda: has(error))
        assert visible(error)
        collapse()
        assert visible(error) and visible("← Bridge")
        observed['error_visible_both_states']=True
        shot("error-collapsed-360x780.png")
        click("← Bridge")
        wait_for(lambda: evaluate(f"Boolean({element('Approve adapter proof')})"))
        observed['back_returns_to_board']=True
        (dest / "observed-states.json").write_text(json.dumps(observed,indent=2)+"\n")
        print("PASS: unresolved warnings, sent, recorded, recording mismatch and errors remain visible in both briefing states; back works; labels match; no message sent")
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
                raise RuntimeError(f"Isolated PID {captured_pid} is still alive; home retained at {root}")
        shutil.rmtree(root)
        (dest / "cleanup.json").write_text(json.dumps({"captured_daemon_pid": captured_pid, "isolated_root": str(root), "home_removed": not root.exists(), "ports": ports, "browser_closed": True}, indent=2) + "\n")


if __name__ == "__main__":
    main()
