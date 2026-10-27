#!/usr/bin/env python3
"""Run small independent counterexamples without changing candidate bytes."""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--worktree', type=Path, required=True)
p.add_argument('--output', type=Path, required=True)
a = p.parse_args()
a.output.mkdir(parents=True, exist_ok=False)
names = [
    'message never decides',
    'decision uses only its reason',
    'both actions keep the other draft',
    'a changed briefing or officer cannot receive a stale action',
    'pending, failure and duplicate presses keep existing behavior',
]
mutations = [
    ('message-reason', 'shared/decision-composer.ts',
     [('draft: () => readDecisionDraft(key).reason,', 'draft: ports.draft,')], [names[1]]),
    ('draft-retention', 'shared/decision-composer.ts',
     [('send: message.send,', 'send: async () => { update(key, { reason: "" }); await message.send(); },')], [names[2]]),
    ('stale-target', 'shared/decision-composer.ts',
     [('if (!current()) return changed;', 'if (false) return changed;'),
      ('return current() ? refusal : changed;', 'return refusal;')], [names[3]]),
    ('pending-lock', 'shared/composer.ts',
     [('ports.setSending(true);', 'ports.setSending(false);')], [names[4]]),
    ('message-decides', 'shared/decision-composer.ts',
     [('const message = composerHandlers({ ...ports, onChip: undefined });',
       'const message = { send: async () => ports.onChip!("准", ports.draft()), onKeyPress: async () => ports.onChip!("准", ports.draft()) };')], [names[0]]),
]
results = []
for label, file, replacements, expected in mutations:
    root = Path(tempfile.mkdtemp(prefix='.validation-mutation-', dir=a.worktree))
    try:
        plugin = root / 'spacedock-bridge'
        shutil.copytree(a.worktree / 'spacedock-bridge', plugin, ignore=shutil.ignore_patterns('node_modules'))
        (plugin / 'node_modules').symlink_to((a.worktree / 'spacedock-bridge/node_modules').resolve(), target_is_directory=True)
        source = plugin / file
        text = source.read_text()
        for old, new in replacements:
            assert old in text, (label, old)
            text = text.replace(old, new)
        source.write_text(text)
        # Select only the relevant names so a deliberately broken lock cannot deadlock another test.
        cmd = [str(plugin / 'node_modules/.bin/tsx'), '--test', '--test-reporter=tap', '--test-name-pattern', '|'.join(expected), 'test/decision-composer.test.mts']
        r = subprocess.run(cmd, cwd=plugin, capture_output=True, text=True, timeout=30)
        log = r.stdout + r.stderr
        (a.output / (label + '.log')).write_text(log)
        failed = [name for name in expected if any(line.startswith('not ok ') and line.endswith(name) for line in log.splitlines())]
        assert r.returncode != 0 and failed == expected, (label, r.returncode, failed)
        results.append(dict(mutation=label, file=file, replacements=replacements, exit=r.returncode, failed=failed))
        print('PASS: ' + label + ' rejected by ' + ', '.join(failed), flush=True)
    finally:
        shutil.rmtree(root)
        (a.output / (label + '-cleanup.json')).write_text(json.dumps(dict(root=str(root), removed=not root.exists()), indent=2) + '\n')
assert set(name for result in results for name in result['failed']) == set(names)
(a.output / 'results.json').write_text(json.dumps(results, indent=2) + '\n')
print('PASS: all five named composer tests reject their relevant broken behavior')
