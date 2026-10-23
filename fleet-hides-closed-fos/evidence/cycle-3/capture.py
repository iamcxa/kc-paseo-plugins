#!/usr/bin/env python3
"""Capture synthetic Bridge interactions using an isolated daemon and browser."""
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
    parser.add_argument("--expect-overflow", action="store_true")
    args = parser.parse_args()
    fo_title = "OMP FO (test model)" if not args.long_name else "OMP FO " + "Very long first officer name for the narrow next card " * 5
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
        return subprocess.run([str(s) for s in command], cwd=worktree, env=command_env or env,
                              check=True, capture_output=True, text=True, timeout=90, **kwargs).stdout.strip()

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
                f'.find(e=>e.textContent.trim().startsWith({json.dumps(prefix)}))')

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
        wait_for(lambda: evaluate(f"Boolean({element('Does OMP')}) && Boolean({element('Approve adapter proof')})"))
        browser("mouse", "move", 700, 100)
        owners = evaluate('Array.from(document.querySelectorAll("[role=button]")).map(e=>e.textContent.trim()).filter(t=>t.startsWith("NEXT") || t.startsWith("Approve adapter proof") || t.startsWith("Does OMP"))')
        assert len(owners) == 3 and all("OMP FO" in t and "Tab closed" in t for t in owners), owners
        if args.long_name:
            geometry = evaluate('(()=>{const card=Array.from(document.querySelectorAll("[role=button]")).find(e=>e.textContent.trim().startsWith("NEXT"));const badge=Array.from(card.querySelectorAll("*")).find(e=>e.textContent==="Tab closed" && !e.children.length).parentElement;const owner=badge.previousElementSibling,row=badge.parentElement;const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width}};return {card:rect(card),row:rect(row),badge:rect(badge),owner:rect(owner),scrollWidth:owner.scrollWidth,clientWidth:owner.clientWidth,flexShrink:getComputedStyle(owner).flexShrink,textOverflow:getComputedStyle(owner).textOverflow}})()')
            (dest / "long-name-geometry.json").write_text(json.dumps(geometry, indent=2) + "\n")
            shot("long-name-next-card.png")
            if args.expect_overflow:
                assert geometry["badge"]["right"] > geometry["row"]["right"], geometry
                print("PASS: baseline reproduced Closed badge overflow with a long owner name")
                return
            assert geometry["badge"]["width"] > 0 and geometry["badge"]["right"] <= geometry["row"]["right"] + 1, geometry
            assert geometry["scrollWidth"] > geometry["clientWidth"] and geometry["flexShrink"] == "1" and geometry["textOverflow"] == "ellipsis", geometry
        badge_styles = 'Array.from(document.querySelectorAll("*")).filter(e=>e.textContent==="Tab closed" && !e.children.length).map(e=>{const b=e.parentElement,s=getComputedStyle(b);return {width:s.borderTopWidth,style:s.borderTopStyle,color:s.borderTopColor,background:getComputedStyle(b.parentElement).backgroundColor}})'
        board_badges = evaluate(badge_styles)
        assert len(board_badges) == 4, board_badges
        assert all(b["width"] == "1px" and b["style"] == "solid" for b in board_badges), board_badges
        assert len({(b["width"], b["style"], b["color"]) for b in board_badges}) == 1, board_badges
        assert board_badges[0]["color"] != evaluate('getComputedStyle(Array.from(document.querySelectorAll("[role=button]")).find(e=>e.textContent.trim().startsWith("NEXT"))).backgroundColor'), board_badges
        assert not evaluate('Array.from(document.querySelectorAll("*")).some(e=>e.textContent==="Closed" && !e.children.length)')
        shot("by-decision-closed.png")
        click("By FO", "tab")
        wait_for(lambda: evaluate(f"Boolean({element(fo_title)})"))
        fo = evaluate(f"{element(fo_title)}.textContent")
        assert "Tab closed" in fo, fo
        fo_badges = evaluate(badge_styles)
        assert len(fo_badges) == 1 and fo_badges[0]["color"] == board_badges[0]["color"], fo_badges
        shot("by-fo-closed.png")
        click("By decision", "tab")
        border = 'getComputedStyle(document.querySelector("textarea").parentElement).borderColor'
        observed = {"candidate": head, "owners": owners, "by-fo": fo, "composer-normal": evaluate(border)}
        browser("hover", "textarea")
        observed["composer-hover"] = evaluate(border)
        browser("fill", "textarea", "Typed locally to verify the rounded focus border; no message sent.")
        observed["composer-focused"] = evaluate(border)
        observed["input"] = evaluate('(()=>{const e=document.querySelector("textarea"),s=getComputedStyle(e);return {value:e.value,focused:document.activeElement===e,outlineStyle:s.outlineStyle,outlineWidth:s.outlineWidth}})()')
        assert len({observed[k] for k in ("composer-normal", "composer-hover", "composer-focused")}) == 3, observed
        assert observed["input"]["focused"] and observed["input"]["outlineStyle"] == "none", observed
        shot("composer-typed-no-outline.png")
        click("Approve adapter proof")
        wait_for(lambda: evaluate(f"Boolean({element('Read full briefing')})"))
        decision_badges = evaluate(badge_styles)
        assert len(decision_badges) == 1 and decision_badges[0]["width"] == "1px" and decision_badges[0]["style"] == "solid" and decision_badges[0]["color"] == board_badges[0]["color"], decision_badges
        assert evaluate('Array.from(document.querySelectorAll("*")).find(e=>e.textContent==="Tab closed" && !e.children.length).parentElement.previousElementSibling.textContent.startsWith("OMP FO")')
        observed["badges"] = {"board": board_badges, "by-fo": fo_badges, "decision": decision_badges}
        observed["closed-fo-opens"] = True
        shot("closed-fo-decision-open.png")
        (dest / "observed-states.json").write_text(json.dumps(observed, indent=2) + "\n")
        print("PASS: Closed badge in By FO, decision rows and next card; typed input outline none; hover/focus borders distinct; Closed FO opens")
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
