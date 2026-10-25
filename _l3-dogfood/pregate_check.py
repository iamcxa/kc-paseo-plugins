#!/usr/bin/env python3
"""FO pre-gate record check for flywheel rounds (Captain ruling A, 2026-10-25).

Usage: pregate_check.py <package root> <state checkout> <task slug>
Exit 0 when every check passes, 1 when one fails (each failure printed), 2 on usage error.
"""
import re
import subprocess
import sys
from pathlib import Path


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
    if rt.returncode != 0:
        failures.append("role_triggers.py: a chief-engineer or engineering-reviewer call is owed or unreadable")

    if "chief-engineer" in text.split("## FO alignment")[0] + "".join(text.split("## FO alignment")[1:]) and "Reviewer: kc-dev-flow-2:chief-engineer" not in text:
        failures.append("chief-engineer is named in the task but no `Reviewer: kc-dev-flow-2:chief-engineer` line is recorded under ## FO alignment")

    for sec in sections(text, "### FO declines"):
        for item in bullets(sec):
            if not re.search(r"\b[0-9a-f]{8,40}\b", item):
                failures.append(f"FO decline without a candidate revision: {item[:80]}")
            if "Would become Material" not in item:
                failures.append(f"FO decline without its Material trigger (not a decline? give it its own heading): {item[:80]}")

    for f in failures:
        print("FAIL", f)
    print("PASS pre-gate record check" if not failures else f"{len(failures)} failure(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
