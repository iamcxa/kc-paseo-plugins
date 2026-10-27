#!/usr/bin/env python3
"""Round 7: real DecisionCard and CoChat with synthetic SDK sends; separate message and reason actions. All executable paths are explicit; no live daemon is read or changed."""
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
    parser.add_argument("--baseline", help="Extract this revision into the disposable plugin for regression assertions")
    parser.add_argument("--width", type=int, choices=[360,1440], required=True)
    args = parser.parse_args()
    fo_title = "Decision proof FO"
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
        if True:
            agents.append((str(uuid.uuid4()), fo_title, {"role": "fo", "repo": "bridge", "task": "adapter-proof", "workflow-dir": str(root / "workflow")}))
        for agent_id, title, labels in agents:
            (root / f"daemon/agents/{agent_id}.json").write_text(json.dumps(dict(
                id=agent_id, title=title, provider="codex", cwd=str(root / "home"), labels=labels,
                createdAt="2026-10-25T00:00:00Z", updatedAt="2026-10-25T00:00:00Z", lastStatus="idle", config=None)))
        gate = dict(slug="adapter-proof", title="Approve the isolated proposal", stage="validation")
        (root / "workflow/.spacedock-state/adapter-proof.md").write_text(
            "---\ngates:\n  records:\n    - stage: validation\n      attempts:\n        - briefing:\n            id: proof:adapter-proof\n            digest: sha256:fixture\n            room-ref: ./room\n---\n")
        room = root / "workflow/.spacedock-state/room"
        room.mkdir()
        (room / "index.json").write_text(json.dumps(dict(question="Approve the isolated proposal?", artifacts=[])))
        (root / "gates.json").write_text(json.dumps({"entities":[]}))
        for name, content in (("spacedock", "print('" + json.dumps({"entities":[]}) + "')"), ("gh", "print('[]')")):
            stub=root / "bin" / name
            stub.write_text("#!/usr/bin/env python3\n"+content+"\n")
            stub.chmod(0o755)
        store=root / "home/.local/share/paseo-fo-coordinator"
        store.mkdir(parents=True)
        (store/"reviews.json").write_text(json.dumps(dict(requests=[],seen={},checkedAt=int(time.time()*1000),error=None)))
        fo_id, _, _ = agents[1]
        fo = dict(id=fo_id,title=fo_title,workflowDir=str(root/"workflow"),repo="fixture",lastActivityAt="2026-10-27T00:00:00Z")
        wrapper = r"""
import { usePaseo } from "@getpaseo/plugin/client";
import { useState } from "react";
import { DecisionCard } from "./client/decision-card";
function ProofCard(props: BoardProps) {
  const paseo = usePaseo();
  const [mount, setMount] = useState(0);
  const proof = globalThis as any;
  if (!proof.__decisionProof) {
    const calls: any[] = [];
    let fail = false;
    const original = paseo.agents.ref.bind(paseo.agents);
    paseo.agents.ref = ((id: string) => {
      const handle = original(id);
      return new Proxy(handle, {get(target,key) {
        if (key === "status") return "idle";
        if (key === "subscribe") return () => () => {};
        if (key === "timeline") return {
          refetch: async () => ({entries:[]}),
          subscribe: () => {const stop:any=()=>{};stop.ready=Promise.resolve();return stop;},
        };
        if (key === "send") return async (text:string) => {
          if (id !== FO_ID && id !== CO_ID) throw Error("Unexpected recipient");
          if(fail){fail=false;throw Error("Synthetic send failure");}
          calls.push({agentId:id,text});
        };
        return Reflect.get(target,key);
      }});
    }) as typeof paseo.agents.ref;
    proof.__decisionProof = {calls,fail:()=>{fail=true},remount:()=>setMount(n=>n+1)};
  }
  return <DecisionCard key={mount} {...props} fo={FO_FIXTURE as any} gate={GATE_FIXTURE as any} onBack={()=>setMount(n=>n+1)} />;
}
""".replace('FO_ID',json.dumps(fo_id)).replace('CO_ID',json.dumps(co_id)).replace('FO_FIXTURE',json.dumps(fo)).replace('GATE_FIXTURE',json.dumps(gate))
        entry=plugin/"index.client.tsx"
        entry.write_text(entry.read_text().replace('<Bridge {...props} />','<ProofCard {...props} />')+wrapper)
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
        wait_for(lambda: evaluate("Boolean(globalThis.__decisionProof)"))
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
        message='[aria-label="Message Decision proof FO"]'
        reason='[aria-label="Reason for 要求修改"]'
        wait_for(lambda: evaluate('document.body.innerText.includes("Approve the isolated proposal?")'))
        assert evaluate('Boolean(document.querySelector('+json.dumps(message)+'))'), "missing separate message control"
        browser("wait",500)
        def has(text):
            return evaluate('document.body.innerText.includes('+json.dumps(text)+')')
        def label(name):
            return 'Array.from(document.querySelectorAll('+json.dumps('[aria-label="'+name+'"]')+')).find(e=>e.checkVisibility())'
        def tap(name):
            evaluate(label(name)+'.click()')
            browser("wait",150)
        def value(selector):
            return evaluate('Array.from(document.querySelectorAll('+json.dumps(selector)+')).find(e=>e.checkVisibility())?.value')
        def focus(selector):
            pos=evaluate('(()=>{const e=Array.from(document.querySelectorAll('+json.dumps(selector)+')).find(e=>e.checkVisibility());const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()')
            browser("mouse","move",pos["x"],pos["y"])
            browser("mouse","down")
            browser("mouse","up")
        def fill(selector, text):
            focus(selector)
            evaluate('Array.from(document.querySelectorAll('+json.dumps(selector)+')).find(e=>e.checkVisibility()).select()')
            browser("keyboard","type",text)
            browser("press","Tab")
            browser("wait",150)
        def calls():
            return evaluate('globalThis.__decisionProof.calls')
        observed=dict(candidate=args.baseline or head,width=args.width,synthetic=True,checks=[])
        assert has("Conversation with Decision proof FO · includes other tasks"), "missing discussion scope label"
        fill(message,"Message retained independently")
        assert value(message)=="Message retained independently", "typed message must be visible"
        tap("Choose 准")
        assert evaluate(label("Confirm 准 via comms officer")+'.getAttribute("aria-disabled")') != "true", "approve permits empty reason"
        tap("Cancel decision")
        tap("Choose 暫緩")
        assert evaluate(label("Confirm 暫緩 via comms officer")+'.getAttribute("aria-disabled")') == "true", "hold requires a reason"
        assert calls()==[], "empty required reasons and choosing never send"
        tap("Cancel decision")
        tap("Choose 要求修改")
        assert value(reason)=="", "message must not seed reason"
        assert calls()==[], "choosing must not send"
        assert evaluate(label("Confirm 要求修改 via comms officer")+'.getAttribute("aria-disabled")') == "true", "revise requires a reason"
        fill(reason,"Reason retained independently")
        assert value(reason)=="Reason retained independently", "typed reason must be visible"
        targets=evaluate('Array.from(document.querySelectorAll("[aria-label]")).filter(e=>e.checkVisibility()&&/^(Choose |Confirm |Cancel decision)/.test(e.getAttribute("aria-label"))).map(e=>{const r=e.getBoundingClientRect();return {label:e.getAttribute("aria-label"),x:r.x,y:r.y,width:r.width,height:r.height}})')
        (dest/"targets.json").write_text(json.dumps(targets,indent=2))
        assert len(targets)==5, targets
        assert all(t["width"]>=44 and t["height"]>=44 for t in targets), targets
        choose=targets[:3]
        assert all(choose[i+1]["x"]>=choose[i]["x"]+choose[i]["width"]+7 for i in range(2)),choose
        send_rect=evaluate('(()=>{const r='+label('Send to Decision proof FO')+'.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom}})()')
        assert all(t["x"]+t["width"]<=send_rect["x"] for t in choose), "choices must stay left of arrow"
        assert not evaluate('document.documentElement.scrollWidth>innerWidth'), "horizontal overflow"
        shot(str(args.width)+"-both-drafts.png")
        observed["targets"]=targets
        observed["checks"].append("separate drafts, correct recipients, labelled discussion, 44px separated targets left of send")
        tap("Cancel decision")
        assert not evaluate('Boolean('+label('Reason for 要求修改')+')')
        tap("Choose 要求修改")
        assert value(reason)=="Reason retained independently"
        evaluate('globalThis.__decisionProof.remount()')
        browser("wait",400)
        assert value(message)=="Message retained independently"
        assert value(reason)=="Reason retained independently"
        focus(message)
        browser("press","Enter")
        wait_for(lambda: len(calls())==1)
        assert value(message)==""
        assert value(reason)=="Reason retained independently"
        first=calls()[0]
        assert first["agentId"]==fo_id and first["text"].startswith("Message retained independently\n\n(Captain's reply on gate adapter-proof"),first
        fill(message,"Message kept after decision")
        focus(reason)
        browser("press","Enter")
        assert len(calls())==1, "reason Enter must not dispatch"
        fill(reason,"Reason retained independently")
        tap("Confirm 要求修改 via comms officer")
        wait_for(lambda: len(calls())==2)
        second=calls()[1]
        assert second["agentId"]==co_id and "Decision: revise" in second["text"] and "My words: 「要求修改，Reason retained independently」" in second["text"],second
        assert "Message kept after decision" not in second["text"]
        assert value(message)=="Message kept after decision"
        tap("Choose 要求修改")
        assert value(reason)=="", "only submitted reason clears"
        fill(reason,"Keep on claim refusal")
        tap("Confirm 要求修改 via comms officer")
        wait_for(lambda: has("You already sent revise"))
        assert len(calls())==2
        assert value(reason)=="Keep on claim refusal"
        tap("Cancel decision")
        evaluate('globalThis.__decisionProof.fail()')
        tap("Send to Decision proof FO")
        wait_for(lambda: has("Synthetic send failure"))
        assert value(message)=="Message kept after decision"
        tap("Choose 暫緩")
        hold='[aria-label="Reason for 暫緩"]'
        assert value(hold)=="Keep on claim refusal"
        shot(str(args.width)+"-kept-after-failure.png")
        observed["checks"].extend(["cancel and remount preserve both drafts", "Enter sends message only with original footer to officer", "reason Enter does not send", "explicit decision confirms original relay to comms officer", "claim conflict keeps reason without duplicate", "message failure keeps message and reason"])
        tap("Send to Decision proof FO")
        wait_for(lambda: len(calls())==3)
        third=calls()[2]
        assert third["agentId"]==fo_id and third["text"].startswith("Message kept after decision\n\n(Captain's reply on gate adapter-proof"),third
        assert "Keep on claim refusal" not in third["text"] and value(hold)=="Keep on claim refusal"
        observed["checks"].extend(["approve permits empty reason; revise and hold require reasons", "successful Send arrow sends only message with existing footer and keeps reason"])
        observed["calls"]=calls()
        (dest/"snapshot.txt").write_text(browser("snapshot","-i"))
        (dest/"observed.json").write_text(json.dumps(observed,indent=2)+"\n")
        print("PASS: separated composer actions and measured targets at "+str(args.width))
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
