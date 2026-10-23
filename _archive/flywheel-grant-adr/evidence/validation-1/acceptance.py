#!/usr/bin/env python3
"""Read-only identity and quotation checks; Python 3 and Git required."""
import argparse
import subprocess
from pathlib import Path

HEAD = "987698fa90a7ec7b05c672872b8b5ba8a7888aa0"
BASE = "e4f95aee269cf14df571fb8f14e4d82d6cb9da45"
ADR = "docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md"


def git(repo, *args):
    return subprocess.check_output(["git", "-C", str(repo), *args])


def quotes(data):
    opening, closing = "「".encode(), "」".encode()
    stack, spans = [], []
    i = 0
    while i < len(data):
        if data.startswith(opening, i):
            stack.append(i)
            i += len(opening)
        elif data.startswith(closing, i):
            assert stack, "unmatched closing quote"
            spans.append(data[stack.pop():i + len(closing)])
            i += len(closing)
        else:
            i += 1
    assert not stack, "unmatched opening quote"
    return spans


def check_quotes(adr, task):
    source = quotes(task.split(b"## Stage Report:", 1)[0])
    actual = quotes(adr)
    assert actual, "no quoted source text"
    assert all(q in source for q in actual), "a quote differs from the accepted source bytes"
    return len(actual)


parser = argparse.ArgumentParser()
parser.add_argument("mode", choices=["identity", "quotes"])
parser.add_argument("repo", type=Path)
parser.add_argument("task", type=Path)
args = parser.parse_args()
assert git(args.repo, "rev-parse", "HEAD").decode().strip() == HEAD, "candidate moved"
assert not git(args.repo, "status", "--porcelain"), "candidate worktree is dirty"
adr = git(args.repo, "show", f"{HEAD}:{ADR}")
assert (args.repo / ADR).read_bytes() == adr, "working ADR differs from candidate"
if args.mode == "identity":
    assert git(args.repo, "diff", "--name-status", BASE, HEAD).decode().strip() == f"A\t{ADR}"
    print(f"PASS exact candidate {HEAD}; clean worktree; only ADR 0008 added")
else:
    task = args.task.read_bytes()
    count = check_quotes(adr, task)
    assert count == 10, f"expected ten nested/outer spans, found {count}"
    print(f"PASS {count} nested/outer quotation spans byte-match accepted task source")
    mutant = adr.replace("Ｂ，但是".encode(), "B，但是".encode(), 1)
    assert mutant != adr
    try:
        check_quotes(mutant, task)
    except AssertionError:
        print("PASS counterexample: changing quoted full-width B to ASCII B is rejected")
    else:
        raise AssertionError("quote comparison accepted a changed source byte")
