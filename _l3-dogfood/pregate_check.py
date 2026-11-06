#!/usr/bin/env python3
"""FO pre-gate record check for flywheel rounds (Captain ruling A, 2026-10-25).

Usage: pregate_check.py <package root> <state checkout> <task slug>
Exit 0 when every check passes, 1 when one fails (each failure printed), 2 on usage error.
"""
import re
import subprocess
import sys
from pathlib import Path

GRANTS = {
    "同意照這個「POC 堆疊版」做": "2026-10-23",
    "可以，我授權你在飛輪過程中推送及開 ＰＲ": "2026-10-23",
}


def sections(text, heading):
    out, cur = [], None
    for line in text.splitlines():
        if line.startswith("#"):
            cur = [] if line.strip() == heading else None
            if cur is not None:
                out.append(cur)
            continue
        if cur is not None:
            cur.append(line)
    return out


def bullets(lines):
    items, cur = [], None
    for line in lines:
        if line.startswith("- "):
            cur = [line]
            items.append(cur)
        elif cur is not None and line.strip():
            cur.append(line)
    return [" ".join(b) for b in items]


def main(argv):
    if len(argv) != 4:
        print(__doc__.strip().splitlines()[2])
        return 2
    package, state, slug = Path(argv[1]), Path(argv[2]), argv[3]
    task = state / f"{slug}.md"
    if not task.is_file():
        task = state / "_archive" / f"{slug}.md"
    text = task.read_text()
    failures = []

    rt = subprocess.run([sys.executable, str(package / "scripts/role_triggers.py"), str(state), slug],
                        capture_output=True, text=True)
    print(rt.stdout.strip() or rt.stderr.strip())
    owed = [l for l in rt.stdout.splitlines() if l.startswith("next:")]
    # Captain 2026-10-27: 「注意用 sol high 取代 sonnet，用 astra xhigh 取代 opus」 — role_triggers ranks only Claude model names.
    astra_ok = lambda l: ("engineering-reviewer on opus" in l or "chief-engineer" in l and "on opus" in l) and re.search(
        r"^Reviewer: kc-dev-flow-2:" + ("engineering-reviewer" if "engineering-reviewer" in l else "chief-engineer") + r" codex/gpt-6-astra:xhigh \d{4}-\d{2}-\d{2} — ",
        text, re.M)
    if rt.returncode != 0 and not (owed and all(astra_ok(l) for l in owed)):
        failures.append("role_triggers.py: a chief-engineer or engineering-reviewer call is owed or unreadable")
    elif rt.returncode != 0:
        print("note: role_triggers wants an opus call; accepted a codex/gpt-6-astra:xhigh Reviewer line under the Captain's model mapping")

    if "chief-engineer" in text.split("## FO alignment")[0] + "".join(text.split("## FO alignment")[1:]) and "Reviewer: kc-dev-flow-2:chief-engineer" not in text:
        failures.append("chief-engineer is named in the task but no `Reviewer: kc-dev-flow-2:chief-engineer` line is recorded under ## FO alignment")

    for sec in sections(text, "### FO declines"):
        for item in bullets(sec):
            if not re.search(r"\b[0-9a-f]{8,40}\b", item):
                failures.append(f"FO decline without a candidate revision: {item[:80]}")
            if "Would become Material" not in item:
                failures.append(f"FO decline without its Material trigger (not a decline? give it its own heading): {item[:80]}")

    for quote, source in re.findall(r"quote: (.+)\n\s+source: '?(.+?)'?$", text, re.M):
        known = GRANTS.get(quote.strip())
        corrected = any(quote.strip() in item and known and known in item and item.startswith("- Correction")
                        for sec in sections(text, "### FO notes") for item in bullets(sec))
        if known and known not in source and not corrected:
            dates = ", ".join(re.findall(r"\d{4}-\d{2}-\d{2}", source)) or "no date"
            failures.append(f"gate conn source for 「{quote.strip()}」 carries {dates}; the Captain said it on {known}")

    for sec in sections(text, "### FO notes"):
        for item in bullets(sec):
            if "FO declines" in item and not item.startswith("- Retracted"):
                failures.append(f"FO note sends findings to FO declines as a rule; decide each finding instead: {item[:80]}")

    for sec in sections(text, "### FO notes"):
        for item in bullets(sec):
            if "after the backlog gate" in item and item.startswith("- Added"):
                if not any("Captain ruling" in other and "」" in other for other in bullets(sec)):
                    failures.append(f"scope added after the backlog gate without a Captain ruling quoted under FO notes: {item[:80]}")

    dispatch = task.parent / slug / "dispatch"
    for record in sorted(dispatch.glob("*-followup-*.md")) if dispatch.is_dir() else []:
        body = record.read_text()
        corrected = any(record.name in item and item.startswith("- Process correction")
                        for sec in sections(text, "### FO notes") for item in bullets(sec))
        checklist = body.split("## Scope notes")[0]
        declared = "investigation" in body.splitlines()[0].lower() and re.search(r"\bno edits\b", checklist)
        if "fix authorization" in body and re.search(r"\bread-only\b", checklist) and not corrected and not declared:
            failures.append(f"{record.name}: one dispatch asks for a read-only diagnosis and authorizes the fix; dispatch them separately")

    for field in ("Non-goals:", "Budget:", "Stop condition:"):
        if not re.search(rf"^{field}[ \t]*\S", text, re.M):
            failures.append(f"seed has no non-empty `{field}` line")

    if any("after the backlog gate" in item and item.startswith("- Added")
           for sec in sections(text, "### FO notes") for item in bullets(sec)) and "\n## Captain amendments\n" not in text:
        failures.append("scope added after the backlog gate but no `## Captain amendments` entry")

    declines = [l for l in text.splitlines() if "FO-declined" in l]
    inside = [" ".join(sec) for sec in sections(text, "### FO declines")]
    for l in declines:
        if not any(l.strip() in block for block in inside):
            failures.append(f"FO decline outside `### FO declines`: {l.strip()[:80]}")

    if dispatch.is_dir():
        records = sorted(dispatch.glob("*-followup-*.md"), key=lambda r: int(re.search(r"followup-(\d+)", r.name).group(1)))
        seen_investigation = False
        for record in records:
            first = record.read_text().splitlines()[0] if record.read_text() else ""
            if "investigation" in first.lower():
                seen_investigation = True
                continue
            if "fix authorization" in first.lower() and not seen_investigation:
                corrected = any(record.name in item and item.startswith("- Process correction")
                                for sec in sections(text, "### FO notes") for item in bullets(sec))
                if not corrected:
                    failures.append(f"{record.name}: fix authorization with no preceding investigation dispatch")
            seen_investigation = False

    for f in failures:
        print("FAIL", f)
    print("PASS pre-gate record check" if not failures else f"{len(failures)} failure(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
