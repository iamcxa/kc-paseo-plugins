#!/usr/bin/env python3
"""Verify keyboard-driven briefing collapse and bounded feedback with fake native keyboard events in an isolated daemon."""
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
        # Native layout and keyboard are test inputs; candidate client/shared modules stay unchanged.
        entry=plugin/'index.client.tsx'
        entry_source=entry.read_text()
        entry_source='import { Keyboard } from "react-native";\nconst proofListeners = new Map<string, Set<(event: unknown) => void>>();\nlet proofMetrics: any;\nKeyboard.addListener = ((name: string, listener: (event: unknown) => void) => {\n  const callbacks = proofListeners.get(name) || new Set();\n  proofListeners.set(name, callbacks); callbacks.add(listener);\n  return { remove: () => callbacks.delete(listener) };\n}) as typeof Keyboard.addListener;\nKeyboard.metrics = () => proofMetrics;\n(globalThis as any).__keyboardProof = (name: string, height = 0) => {\n  proofMetrics = height ? { height, width: 360, screenX: 0, screenY: 780-height } : undefined;\n  const event = { duration: 0, easing: "keyboard", endCoordinates: proofMetrics || {height:0,width:360,screenX:0,screenY:780} };\n  for (const callback of proofListeners.get(name) || []) callback(event);\n};\nKeyboard.dismiss = () => (globalThis as any).__keyboardProof("keyboardDidHide", 0);\n'+entry_source.replace('<Bridge {...props} />','<Bridge {...props} layout={{...props.layout, platform: "android"}} />')
        entry.write_text(entry_source)
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
                        foId=fo_id, decision="approve", words="Synthetic approval", at=int(time.time()*1000))
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
        wait_for(lambda: has("Sent to the comms officer"))
        def keyboard(name,height=0):
            evaluate('globalThis.__keyboardProof('+json.dumps(name)+','+str(height)+')')
            browser("wait", 300)
        def geometry():
            return evaluate('''(()=>{
              const input=document.querySelector('textarea[placeholder^="Message Draft proof FO directly"]');
              const composer=input.parentElement.parentElement;
              const chat=composer.parentElement;
              const rect=e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,width:r.width}};
              const discussion=Array.from(chat.querySelectorAll('div')).find(e=>!e.childElementCount && e.textContent==='DISCUSSION');
              const text=Array.from(document.querySelectorAll('div')).find(e=>!e.childElementCount && e.textContent.includes('Long multiline reason line 1:'));
              return {chat:rect(chat),composer:rect(composer),input:rect(input),discussion:rect(discussion),feedback:text?rect(text):null,keyboardPadding:Number.parseFloat(getComputedStyle(chat).paddingBottom),expanded:Boolean(document.querySelector('[aria-label="Hide briefing"]')),collapsed:Boolean(document.querySelector('[aria-label="Show briefing"]')),viewport:{width:innerWidth,height:innerHeight}};
            })()''')
        observed=dict(candidate=head,synthetic=True,native_keyboard="faked host boundary; RN web layout",before=geometry())
        assert observed['before']['expanded'], "Fixture did not start expanded"
        keyboard("keyboardDidShow",284)
        observed['keyboard_open']=geometry()
        shot("keyboard-open-360x780.png")
        keyboard("keyboardDidHide")
        observed['after_hide']=geometry()
        # Reopen with a multiline sent reason, without sending anything.
        click("← Bridge")
        long_reason="\n".join('Long multiline reason line '+str(i)+': synthetic text for bounded feedback' for i in range(1,41))
        decision['words']=long_reason
        (store/'decisions.json').write_text(json.dumps([decision]))
        open_gate("adapter")
        wait_for(lambda: has("Long multiline reason line 1:"))
        observed['long_reason']=geometry()
        shot("long-reason-360x780.png")
        observed['more_control']=has("More")
        (dest/'observed-states.json').write_text(json.dumps(observed,indent=2)+"\n")
        assert observed['keyboard_open']['collapsed'], "Expanded briefing did not collapse when keyboard opened"
        opened=observed['keyboard_open']
        assert opened['chat']['height'] >= 284+opened['composer']['height'], opened
        assert opened['composer']['bottom'] <= 780-284+1, opened
        assert observed['after_hide']['expanded'], "Keyboard hide did not restore expanded preference"
        long=observed['long_reason']
        assert long['feedback']['height'] <= 32+1, long
        assert long['composer']['bottom'] <= 780+1 and long['composer']['top']-long['discussion']['bottom'] >= 46, long
        assert observed['more_control'], "Full feedback has no More control"
        click("More")
        wait_for(lambda: has("Decision feedback"))
        browser("wait", 800)
        (dest/'more-snapshot.txt').write_text(browser("snapshot", "-i"))
        (dest/'more-geometry.json').write_text(json.dumps(evaluate("Array.from(document.querySelectorAll('div')).filter(e=>!e.childElementCount && e.textContent==='Decision feedback').map(e=>({rect:e.getBoundingClientRect().toJSON(),visible:e.checkVisibility(),html:e.outerHTML}))"),indent=2)+"\n")
        assert has("Long multiline reason line 40:"), "Full reason was lost"
        shot("feedback-more-360x780.png")
        assert evaluate("(()=>{const title=Array.from(document.querySelectorAll('div')).find(e=>!e.childElementCount && e.textContent==='Decision feedback');return title && title.checkVisibility() && title.getBoundingClientRect().bottom<innerHeight})()"), "More title is not visible"
        evaluate("(()=>{const text=Array.from(document.querySelectorAll('div')).find(e=>!e.childElementCount && e.textContent.includes('Long multiline reason line 40:') && e.getBoundingClientRect().height>100);let p=text.parentElement;while(p && !['auto','scroll'].includes(getComputedStyle(p).overflowY))p=p.parentElement;if(!p)throw Error('Full feedback is not scrollable');p.setAttribute('data-feedback-proof-scroll','true')})()")
        browser("scroll", "down", 4000, "--selector", "[data-feedback-proof-scroll]")
        browser("wait", 300)
        assert evaluate("(()=>{const text=Array.from(document.querySelectorAll('div')).find(e=>!e.childElementCount && e.textContent.includes('Long multiline reason line 40:') && e.getBoundingClientRect().height>100);const r=text.getBoundingClientRect();const p=document.querySelector('[data-feedback-proof-scroll]').getBoundingClientRect();return r.bottom<=p.bottom+1 && r.bottom>p.top})()"), "The last reason line is not reachable"
        shot("feedback-more-end-360x780.png")
        browser("mouse", "move", 180, 200)
        browser("mouse", "down")
        browser("mouse", "up")
        wait_for(lambda: not has("Decision feedback"))
        click("Hide briefing ▴")
        keyboard("keyboardDidShow",284)
        keyboard("keyboardDidHide")
        observed['collapsed_preference_restored']=geometry()['collapsed']
        assert observed['collapsed_preference_restored'], "Keyboard cycle changed the collapsed preference"
        click("Show briefing ▾")
        keyboard("keyboardDidShow",284)
        observed['long_reason_keyboard']=geometry()
        both=observed['long_reason_keyboard']
        assert both['collapsed'] and both['chat']['height'] >= 284+both['composer']['height'], both
        assert both['composer']['bottom'] <= 780-284+1, both
        shot("long-reason-keyboard-open-360x780.png")
        keyboard("keyboardDidHide")
        observed['expanded_preference_restored']=geometry()['expanded']
        assert observed['expanded_preference_restored']
        (dest/'observed-states.json').write_text(json.dumps(observed,indent=2)+"\n")
        print("PASS: native compact keyboard auto-collapse/restoration, composer geometry, bounded long feedback and full More view; no message sent")
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
