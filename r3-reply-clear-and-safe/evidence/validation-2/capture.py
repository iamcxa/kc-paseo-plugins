#!/usr/bin/env python3
"""Verify memory-only reply drafts in an isolated daemon with synthetic agents and gates."""
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
                "artifacts": [{"summary": "Screenshot fixture: hover, press and decision colors only.", "uri": "fixture"}]}))
            (root / f"workflow/.spacedock-state/{slug}.md").write_text(
                f"---\ntitle: {slug}\ngates:\n  records:\n    - stage: validation\n      attempts:\n"
                f"        - briefing:\n            id: proof:{slug}\n            digest: sha256:proof\n"
                f"            room-ref: ./{slug}/review/validation/briefing-1\n---\n")
        for title, labels in (("Comms officer", {"role": "comms-officer"}),
                              (fo_title, {"role": "fo", "repo": "bridge", "task": "adapter-proof",
                               "workflow-dir": str(root / "workflow"), "next-owner": "captain",
                               "next": "Does OMP need its own Spacedock host adapter?",
                               "paseo.open-agent-tab.desktop": "false", "paseo.open-agent-tab.phone": "false"})):
            agent_id = str(uuid.uuid4())
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
        evaluate("""(() => {
          const original = WebSocket.prototype.send;
          window.__proof = {count:0, pending:[]};
          WebSocket.prototype.send = function(data) {
            let frame; try { frame=JSON.parse(data); } catch {}
            const m=frame?.message;
            if (m?.type === 'send_agent_message_request') {
              window.__proof.count++;
              window.__proof.pending.push({socket:this, requestId:m.requestId, agentId:m.agentId});
              return;
            }
            return original.call(this,data);
          };
          window.__proof.settle = (accepted) => {
            const p=window.__proof.pending.shift();
            if (!p) throw Error('No intercepted request');
            p.socket.dispatchEvent(new MessageEvent('message',{data:JSON.stringify({type:'session',message:{
              type:'send_agent_message_response',payload:{requestId:p.requestId,agentId:p.agentId,
              accepted,error:accepted?null:'Synthetic delayed refusal'}}})}));
          };
          return true;
        })()""")
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
        co = input_for("Message the comms officer")
        fo = input_for("Message Draft proof FO directly")
        wait_for(lambda: evaluate('Boolean(document.querySelector(' + json.dumps(co) + '))'))
        fill(co, "Comms question still being written")
        open_gate("adapter")
        fill(fo, "Gate A reason still being written")
        shot("wide-gate-a-typed.png")
        click("←")
        open_gate("hover")
        assert value(fo) == "", "Gate A leaked into gate B"
        shot("wide-gate-b-empty.png")
        click("←")
        open_gate("adapter")
        if args.baseline:
            assert value(fo) == "", "Baseline unexpectedly kept the gate draft"
            shot("baseline-gate-a-lost.png")
            print("PASS: previous stack layer loses gate A draft on back/open; candidate must reverse this")
            return
        assert value(fo) == "Gate A reason still being written", "Gate A draft was lost"
        assert value(co) == "Comms question still being written", "Comms draft was lost"
        assert has("↑ sends to Draft proof FO") and has("Decide via comms officer"), "Delivery labels missing"
        assert evaluate('Boolean(document.querySelector(' + json.dumps('[aria-label="Send to Draft proof FO"]') + '))')
        shot("wide-gate-a-restored-and-labels.png")
        observed["wide_gate_a_restored"] = True
        observed["wide_gate_b_empty"] = True
        send_selector = '[aria-label="Send to Draft proof FO"]'
        def locked():
            return evaluate('document.querySelector(' + json.dumps(send_selector) + ').getAttribute("aria-disabled")==="true"')
        def send_click():
            browser("click", send_selector)
        def count():
            return evaluate('window.__proof.count')
        send_click()
        wait_for(lambda: count() == 1)
        click("←")
        open_gate("adapter")
        assert locked() and has("sending…"), "Remount lost pending send state"
        browser("click", fo)
        browser("press", "Enter")
        evaluate('document.querySelector(' + json.dumps(send_selector) + ').click()')
        assert count() == 1, "Reopened composer dispatched twice"
        shot("slow-send-reopened-disabled.png")
        evaluate('window.__proof.settle(true)')
        wait_for(lambda: value(fo) == "" and not has("sending…"))
        shot("slow-send-reopened-cleared.png")
        observed["slow_send_reopen_no_duplicate_and_clear"] = True
        fill(fo, "Second submitted draft")
        send_click()
        wait_for(lambda: count() == 2)
        click("←")
        open_gate("adapter")
        fill(fo, "Newer edit while send pending")
        assert locked(), "Editing unlocked a pending send"
        evaluate('window.__proof.settle(true)')
        wait_for(lambda: not has("sending…"))
        assert value(fo) == "Newer edit while send pending", "Late completion erased newer edit"
        shot("slow-send-newer-edit-kept.png")
        observed["late_success_keeps_newer_edit"] = True
        send_click()
        wait_for(lambda: count() == 3)
        click("←")
        open_gate("adapter")
        assert locked()
        evaluate('window.__proof.settle(false)')
        wait_for(lambda: not locked())
        assert value(fo) == "Newer edit while send pending", "Refusal erased draft"
        shot("slow-send-refusal-reenabled.png")
        observed["late_refusal_keeps_draft_and_reenables"] = True
        observed["intercepted_send_count"] = count()
        assert count() == 3 and evaluate('window.__proof.pending.length') == 0
        click("←")
        click("By FO", "tab")
        wait_for(lambda: evaluate(f"Boolean({element('Review an unowned change')})"))
        click("Review an unowned change")
        assert value(co) == "Comms question still being written", "Ask comms officer overwrote an existing draft"
        shot("wide-seed-preserves-comms.png")
        observed["seed_preserves_existing"] = True
        click("By decision", "tab")
        browser("set", "viewport", 520, 1000)
        shot("compact-entry.png")
        enter_bridge()
        wait_for(lambda: evaluate(f"Boolean({element('FOs', 'tab')})"))
        click("Comms officer", "tab")
        wait_for(lambda: evaluate('Boolean(document.querySelector(' + json.dumps(co) + '))'))
        fill(co, "Compact comms draft in progress")
        shot("compact-comms-typed.png")
        click("FOs", "tab")
        wait_for(lambda: evaluate(f"Boolean({element('Approve adapter proof')})"))
        open_gate("adapter")
        fill(fo, "Compact gate A draft in progress")
        shot("compact-gate-a-typed.png")
        click("Comms officer", "tab")
        wait_for(lambda: evaluate('Boolean(document.querySelector(' + json.dumps(co) + '))'))
        assert value(co) == "Compact comms draft in progress", "Compact tab lost the comms draft"
        shot("compact-comms-restored.png")
        click("FOs", "tab")
        wait_for(lambda: evaluate(f"Boolean({element('Approve adapter proof')})"))
        open_gate("adapter")
        assert value(fo) == "Compact gate A draft in progress", "Compact tab lost the gate draft"
        assert has("↑ sends to Draft proof FO") and has("Decide via comms officer")
        shot("compact-gate-a-restored-and-labels.png")
        observed["compact_both_tabs_kept_drafts"] = True
        click("Comms officer", "tab")
        wait_for(lambda: evaluate('Boolean(document.querySelector(' + json.dumps(co) + '))'))
        browser("click", co)
        evaluate('document.querySelector(' + json.dumps(co) + ').select()')
        browser("press", "Backspace")
        assert value(co) == "", "Keyboard deletion did not clear the textarea: " + repr(value(co))
        shot("compact-comms-cleared.png")
        click("FOs", "tab")
        wait_for(lambda: evaluate(f"Boolean({element('Approve adapter proof')})"))
        click("Comms officer", "tab")
        wait_for(lambda: evaluate('Boolean(document.querySelector(' + json.dumps(co) + '))'))
        assert value(co) == "", "Draft returned after clearing and remount: " + repr(value(co))
        fill(co, "Comms reload probe")
        observed["consumed_seed_stays_cleared"] = True
        observed["reload_probe"] = "not part of this scoped walk; architectural limit documented"
        (dest / "observed-states.json").write_text(json.dumps(observed, indent=2) + "\n")
        print("PASS: wide gate isolation/remount, seed preservation, compact drafts, recipient labels and clearing/remount; three sends intercepted in browser memory, no message or decision delivered")
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
