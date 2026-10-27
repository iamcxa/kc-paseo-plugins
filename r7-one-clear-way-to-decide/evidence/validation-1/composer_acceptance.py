#!/usr/bin/env python3
"""Compact composer acceptance: actual CoChat with synthetic drafts and a 280px Keyboard.metrics fixture. All executable paths are explicit; no live daemon is read or changed."""
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
    parser.add_argument("--probe-only", action="store_true")
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
            for slug in ("adapter-proof", "second-proof"):
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
        long_repo = "long-repository-name-" * 4 + "final"
        review_fixture = root / "review-fixture.json"
        review_fixture.write_text(json.dumps(dict(requests=[],checkedAt=1,error=None,nextCheckAt=None)))
        server = plugin / "index.server.ts"
        server_text = server.read_text()
        assert server_text.count('server.handle(readReviews, (_input, { paseo }) => {')==1
        server_text = server_text.replace('server.handle(readReviews, (_input, { paseo }) => {', 'server.handle(readReviews, async (_input, { paseo }) => {')
        server_text = server_text.replace('return readReviewsHandler();', 'return JSON.parse(await proofReadFile('+json.dumps(str(review_fixture))+', "utf8"));')
        server.write_text('import { readFile as proofReadFile } from "node:fs/promises";\n'+server_text)
        entry = plugin / "index.client.tsx"
        fo_id, _, fo_labels = agents[1]
        fo_labels = dict(fo_labels, repo="bridge,"+long_repo, **{"next-owner":"captain", "next":"CL merges the release documents; confirm the remaining changes"})
        fo_fixture = dict(id=fo_id, title=fo_title, cwd=str(root/'home'), status='idle', updatedAt='2026-10-27T00:00:00Z', labels=fo_labels)
        other = dict(fo_fixture,id=str(uuid.uuid4()),title="Next question FO",updatedAt="2026-10-27T01:00:00Z",labels={"role":"fo","next-owner":"captain","next":"審 #1306：確認下一列的文字和背景邊界"})
        wrapper = r"""
import { usePaseo } from "@getpaseo/plugin/client";
import { View, Text, Keyboard } from "react-native";
import { CoChat } from "./client/co-chat";
import { useState } from "react";
function ProofComposer(props: BoardProps) {
  const paseo=usePaseo();
  const [height,setHeight]=useState(0);
  const proof=globalThis as any;
  if(!proof.__composerProof){
    const calls:any[]=[];
    const original=paseo.agents.ref.bind(paseo.agents);
    paseo.agents.ref=((id:string)=>new Proxy(original(id),{get(target,key){
      if(key==="subscribe")return ()=>()=>{};
      if(key==="timeline")return {refetch:async()=>({entries:[]}),subscribe:()=>{const stop:any=()=>{};stop.ready=Promise.resolve();return stop;}};
      if(key==="send")return async(text:string)=>{calls.push({message:text});};
      return Reflect.get(target,key);
    }})) as typeof paseo.agents.ref;
    const listeners=new Map<string,Set<(event:any)=>void>>();
    proof.__composerProof={calls,height:0,listeners};
    Keyboard.metrics=()=>proof.__composerProof.height?{height:proof.__composerProof.height,width:360,screenX:0,screenY:360}:undefined;
    Keyboard.addListener=((name:string,listener:(event:any)=>void)=>{
      let group=listeners.get(name);if(!group)listeners.set(name,group=new Set());group.add(listener);
      return {remove:()=>group!.delete(listener)};
    }) as typeof Keyboard.addListener;
  }
  proof.__composerProof.openKeyboard=()=>{
    proof.__composerProof.height=280;setHeight(280);
    for(const listener of proof.__composerProof.listeners.get("keyboardDidShow")||[])listener({endCoordinates:{height:280}});
  };
  return <View style={{flex:1,minHeight:0}}>
    <CoChat {...props} layout={{...props.layout,platform:"ios",compact:true}} agentId=FO_ID title="Compact proof FO" chips={["准","要求修改","先不要"]} decisionTarget="compact-proof" onChip={async(word,reason)=>{proof.__composerProof.calls.push({word,reason});return null;}} />
    <View pointerEvents="auto" accessibilityLabel="Simulated keyboard" style={{position:"absolute",left:0,right:0,bottom:0,height,backgroundColor:props.theme.colors.surface2,alignItems:"center",justifyContent:"center"}}><Text style={{color:props.theme.colors.foreground}}>Simulated keyboard · 280 px</Text></View>
  </View>;
}
""".replace('FO_ID',json.dumps(fo_id))
        entry.write_text(entry.read_text().replace('<Bridge {...props} />','<ProofComposer {...props} />')+wrapper)
        config.write_text(json.dumps(dict(profile=str(root / "browser-profile"), plugins=[], colorScheme="dark",
                                          args="--host-resolver-rules=MAP localhost ~NOTFOUND")))
        with (root / "daemon.log").open("w") as log:
            daemon = subprocess.Popen([str(args.paseo), "daemon", "run", "--home", str(root / "daemon")],
                                      cwd=worktree, env=env, stdout=log, stderr=log, start_new_session=True)
        wait_for(lambda: (root / "daemon/paseo.pid").exists())
        captured_pid = json.loads((root / "daemon/paseo.pid").read_text())["pid"]
        (dest/"launch.json").write_text(json.dumps({"pid":captured_pid,"root":str(root),"ports":ports}))
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
        wait_for(lambda: evaluate("Boolean(globalThis.__composerProof)"))
        browser("set", "viewport", args.width, 1000 if args.width == 1440 else 640)
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
        def label(name):
            return 'Array.from(document.querySelectorAll("[aria-label]")).find(e=>e.checkVisibility()&&e.getAttribute("aria-label")==='+json.dumps(name)+')'
        def tap(name):
            evaluate(label(name)+'.scrollIntoView({block:"center"})')
            pos=evaluate('(()=>{const r='+label(name)+'.getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()')
            browser('mouse','move',pos['x'],pos['y']);browser('mouse','down');browser('mouse','up');browser('wait',150)
        def fill(name,text):
            tap(name)
            evaluate(label(name)+'.select()')
            browser('keyboard','type',text);browser('press','Tab');browser('wait',150)
        wait_for(lambda:evaluate('Boolean('+label('Message Compact proof FO')+')'))
        fill('Message Compact proof FO',"Long message draft with retained edits. "*125)
        tap('Choose 要求修改')
        fill('Reason for 要求修改',("Long reason draft with retained edits. "*5+"\n")*25)
        evaluate("globalThis.__composerProof.openKeyboard()")
        browser("wait",300)
        measurement=evaluate(r'''(()=>{
          const message=MESSAGE,reason=REASON,keyboard=KEYBOARD;
          const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
          let scroll=message.parentElement;
          while(scroll&&!(scroll.contains(reason)&&['auto','scroll'].includes(getComputedStyle(scroll).overflowY)))scroll=scroll.parentElement;
          return {message:{length:message.value.length,rect:rect(message)},reason:{length:reason.value.length,rect:rect(reason)},keyboard:rect(keyboard),scroll:scroll?{rect:rect(scroll),height:scroll.clientHeight,contentHeight:scroll.scrollHeight,shrink:getComputedStyle(scroll).flexShrink}:null};
        })()'''.replace('MESSAGE',label('Message Compact proof FO')).replace('REASON',label('Reason for 要求修改')).replace('KEYBOARD',label('Simulated keyboard')))
        (dest/'composer-observed.json').write_text(json.dumps(dict(candidate=args.baseline or head,width=args.width,simulatedKeyboardHeight=280,measurement=measurement),indent=2)+'\n')
        shot('long-drafts-before-scroll.png')
        assert measurement['message']['length']>1000 and measurement['reason']['length']>1000,measurement
        assert measurement['scroll'] and measurement['scroll']['rect']['bottom']<=measurement['keyboard']['y']+.5, ('both composers need one bounded scroll area above keyboard',measurement)
        assert measurement['scroll']['contentHeight']>measurement['scroll']['height'] and measurement['scroll']['shrink']=='1',measurement
        def reachable(name):
            evaluate(label(name)+'.scrollIntoView({block:"end"})');browser('wait',200)
            result=evaluate(r'''(()=>{const e=BUTTON,k=KEYBOARD;const r=e.getBoundingClientRect(),kr=k.getBoundingClientRect();const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height,keyboardTop:kr.top,hit:e===hit||e.contains(hit),enabled:e.getAttribute('aria-disabled')!=='true'}})()'''.replace('BUTTON',label(name)).replace('KEYBOARD',label('Simulated keyboard')))
            assert result['hit'] and result['enabled'] and result['bottom']<=result['keyboardTop']+.5 and result['height']>=44,result
            return result
        confirm=reachable('Confirm 要求修改 via comms officer');cancel=reachable('Cancel decision')
        shot('long-drafts-controls-reachable.png')
        tap('Cancel decision')
        assert evaluate('!'+label('Confirm 要求修改 via comms officer')), 'cancel must respond to a real pointer tap'
        tap('Choose 要求修改');reachable('Confirm 要求修改 via comms officer');tap('Confirm 要求修改 via comms officer')
        calls=evaluate('globalThis.__composerProof.calls')
        assert len(calls)==1 and calls[0]['word']=='要求修改' and len(calls[0]['reason'])>1000,calls
        measurement.update(confirm=confirm,cancel=cancel,confirmed=True,cancelled=True,decisionCalls=len(calls),messageRetained=evaluate(label('Message Compact proof FO')+'.value.length'))
        assert measurement['messageRetained']==measurement['message']['length'],measurement
        (dest/'composer-observed.json').write_text(json.dumps(dict(candidate=args.baseline or head,width=args.width,simulatedKeyboardHeight=280,measurement=measurement),indent=2)+'\n')
        print('PASS: long message and reason share bounded scrolling; real Confirm and Cancel taps above simulated keyboard')

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
        for cleanup_attempt in range(5):
            try:
                shutil.rmtree(root)
                break
            except OSError:
                if cleanup_attempt==4: raise
                time.sleep(0.2)
        (dest / "cleanup.json").write_text(json.dumps({"captured_daemon_pid": captured_pid, "isolated_root": str(root), "home_removed": not root.exists(), "ports": ports, "browser_closed": True}, indent=2) + "\n")


if __name__ == "__main__":
    main()
