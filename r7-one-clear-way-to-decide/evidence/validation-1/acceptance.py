#!/usr/bin/env python3
"""Five fresh-shell acceptance steps; invoke sequentially, never concurrently."""
import argparse
from pathlib import Path
import subprocess
import tempfile
import time

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('step', choices=['checks', 'message-360', 'keyboard-360', 'queue-360', 'queue-1440'])
parser.add_argument('--worktree', type=Path, default=Path('/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r7-one-clear-way-to-decide'))
parser.add_argument('--paseo', type=Path, default=Path('/Users/kent/.local/bin/paseo'))
parser.add_argument('--browser', type=Path, default=Path('/Users/kent/.npm-global/bin/agent-browser'))
parser.add_argument('--web-dist', type=Path, default=Path('/Applications/Paseo.app/Contents/Resources/app-dist'))
args = parser.parse_args()
evidence = Path(__file__).resolve().parent
head = subprocess.check_output(['git', '-C', str(args.worktree), 'rev-parse', 'HEAD'], text=True).strip()
assert head == '316c9eff7bd6ce2f5e15db7382dea1aba1197a26', 'Wrong candidate'
assert not subprocess.check_output(['git', '-C', str(args.worktree), 'status', '--porcelain'], text=True).strip(), 'Candidate must be clean; stop any overlapping capture'
output = Path(tempfile.mkdtemp(prefix='rerun-' + args.step + '-', dir=evidence))
started = time.monotonic()
if args.step == 'checks':
    for name, command in [('npm-ci', ['npm', 'ci', '--no-audit', '--no-fund']), ('typecheck', ['npm', 'run', 'typecheck']), ('tests', ['npm', 'test'])]:
        with (output / (name + '.log')).open('x') as log:
            subprocess.run(command, cwd=args.worktree / 'spacedock-bridge', stdout=log, stderr=subprocess.STDOUT, check=True)
    print('PASS: npm ci, typecheck and all 140 tests')
else:
    script = {'message-360': 'capture.py', 'keyboard-360': 'composer_acceptance.py', 'queue-360': 'queue_acceptance.py', 'queue-1440': 'queue_acceptance.py'}[args.step]
    subprocess.run(['python3', str(evidence / script), '--worktree', str(args.worktree), '--paseo', str(args.paseo), '--browser', str(args.browser), '--web-dist', str(args.web_dist), '--width', args.step.rsplit('-', 1)[1], '--port', '0', '--output', str(output / 'capture')], check=True)
print('Evidence: ' + str(output))
print('Elapsed seconds: ' + str(round(time.monotonic() - started, 1)))
