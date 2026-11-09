"""Offline checks of saved native evidence; never connects to a daemon or model."""
import copy
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import unittest

HERE = Path(__file__).resolve().parent
EVIDENCE = HERE.parent
WT = Path('/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d7-list-chief-of-staff')
HEAD = '3fbbdfb9845ba04935e1d703c837e3d1ab26542b'
MUTATION = sys.argv.pop(1) if len(sys.argv) > 1 and sys.argv[1] in ('early-relay', 'permission-relay') else None

def load(cycle, name):
    return json.loads((EVIDENCE / cycle / name).read_text())

def calls(page, name):
    return [e for e in page['entries'] if e['item'].get('name') == name]

def payload(entry):
    return entry['item']['detail']['input']

def preview_messages(spec):
    # Parse only this capture's string concatenations; do not evaluate tool code.
    env = {}
    decoder = json.JSONDecoder()
    for line in spec.splitlines():
        if line.startswith('Card('):
            break
        name, expr = line.split(' = ', 1)
        value = ''
        while expr:
            expr = expr.lstrip()
            if expr.startswith('"'):
                part, end = decoder.raw_decode(expr)
            else:
                token = re.match(r'[A-Za-z][A-Za-z0-9_]*', expr)
                assert token, expr
                part, end = env[token[0]], len(token[0])
            value += part
            expr = expr[end:].strip()
            if expr:
                assert expr.startswith('+'), expr
                expr = expr[1:].strip()
        env[name] = value
    destinations = re.findall(r'\["收件 agent", "([^"]+)"\]', spec)
    assert len(destinations) == 3
    return dict(zip(destinations, [env['m1'], env['m2'], env['m3']]))

class EvidenceChecks(unittest.TestCase):
    def setUp(self):
        self.run = load('cycle-3', 'real-list-run.json')
        self.preview = load('cycle-3', 'preview-chief-timeline.json')
        self.confirmed = load('cycle-3', 'confirmed-chief-timeline.json')
        if MUTATION == 'early-relay':
            self.preview['entries'].append(copy.deepcopy(calls(self.confirmed, 'mcp__paseo__send_agent_prompt')[0]))
        if MUTATION == 'permission-relay':
            bad = copy.deepcopy(calls(self.confirmed, 'mcp__paseo__send_agent_prompt')[0])
            payload(bad)['agentId'] = self.run['targets'][3]
            self.confirmed['entries'].append(bad)

    def test_no_relay_on_all_recommendations_before_separate_confirmation(self):
        words = [e['item'].get('text') for e in self.preview['entries'] if e['item']['type'] == 'user_message']
        self.assertIn('全照建議', words)
        self.assertNotIn('確認發送以上預覽', words)
        self.assertEqual(calls(self.preview, 'mcp__paseo__send_agent_prompt'), [])
        self.assertEqual(calls(self.preview, 'mcp__paseo__create_agent'), [])
        self.assertEqual(len(calls(self.preview, 'mcp__paseo__render_ui')), 1)
        for target in self.run['targets']:
            page = load('cycle-3', 'preview-' + target + '-timeline.json')
            self.assertFalse(any(e['item'].get('agentMessage', {}).get('event') == 'message' for e in page['entries']))

    def test_permission_never_relayed_or_decided(self):
        permission = self.run['targets'][3]
        self.assertNotIn(permission, [payload(e)['agentId'] for e in calls(self.confirmed, 'mcp__paseo__send_agent_prompt')])
        self.assertEqual(calls(self.confirmed, 'mcp__paseo__respond_to_permission'), [])
        page = load('cycle-3', 'delivered-' + permission + '-timeline.json')
        self.assertFalse(any(e['item'].get('agentMessage', {}).get('event') == 'message' for e in page['entries']))

    def test_exact_preview_recipient_payload_and_one_native_receipt_per_item(self):
        preview = calls(self.preview, 'mcp__paseo__render_ui')[0]
        self.assertEqual(preview['item']['status'], 'completed')
        expected = preview_messages(payload(preview)['spec'])
        relays = calls(self.confirmed, 'mcp__paseo__send_agent_prompt')
        self.assertEqual(len(relays), 3)
        self.assertEqual(set(expected), set(self.run['targets'][:3]))
        confirm_index = next(i for i, e in enumerate(self.confirmed['entries']) if e['item'].get('text') == '確認發送以上預覽')
        for e in relays:
            self.assertGreater(self.confirmed['entries'].index(e), confirm_index)
            target, text = payload(e)['agentId'], payload(e)['prompt']
            self.assertEqual(text, expected[target].replace('<his confirmation, quoted exactly>', '確認發送以上預覽'))
            message_id = e['item']['detail']['output']['output']['messageId']
            page = load('cycle-3', 'delivered-' + target + '-timeline.json')
            incoming = [r for r in page['entries'] if r['item'].get('agentMessage', {}).get('event') == 'message']
            self.assertEqual(len(incoming), 1)
            self.assertEqual(incoming[0]['item']['callId'], 'paseo-agent-message:' + message_id)
            self.assertEqual(incoming[0]['item']['agentMessage']['text'], text)

    def test_two_restarts_preserve_content_without_turns_or_relays(self):
        for stage, phase in [('list', 'calling'), ('preview', 'quiet')]:
            observed = load('cycle-3', 'restart-after-' + stage + '.json')
            self.assertEqual(observed['state']['phase'], phase)
            self.assertIsNone(observed['state']['error'])
            self.assertEqual(observed['newTurns'], [])
            self.assertEqual([observed[k] for k in ['automatedBatches', 'relayCalls', 'permissionCalls']], [1, 0, 0])
            self.assertEqual([t['received'] for t in observed['targets']], [0, 0, 0, 0])
        before = self.preview['entries']
        after = load('cycle-3', 'restart-after-preview-timeline.json')['entries']
        self.assertEqual([e['item']['text'] for e in before if e['item']['type'] == 'assistant_message'], [e['item']['text'] for e in after if e['item']['type'] == 'assistant_message'])
        self.assertEqual(payload(calls(self.preview, 'mcp__paseo__render_ui')[0]), payload(calls({'entries': after}, 'mcp__paseo__render_ui')[0]))
        self.assertEqual(sum(e['item']['type'] == 'plugin' for e in before), 2)
        self.assertEqual(sum(e['item']['type'] == 'plugin' for e in after), 0)

    def test_runtime_manifest_candidate_hashes_and_exact_head_delta(self):
        summary = []
        for cycle in ['cycle-2', 'cycle-3']:
            manifest = load(cycle, 'runtime-source-manifest.json')
            changed = []
            for row in manifest['files']:
                data = subprocess.check_output(['git', '-C', str(WT), 'show', manifest['head'] + ':spacedock-bridge/' + row['path']])
                self.assertEqual(hashlib.sha256(data).hexdigest(), row['candidateSha256'], row['path'])
                self.assertEqual(row['identical'], row['candidateSha256'] == row['runtimeSha256'])
                if not row['identical']:
                    changed.append(row['path'])
            self.assertEqual(changed, ['server/chief.ts'])
            self.assertEqual(load(cycle, 'acceptance.json')['head'], manifest['head'])
            summary.append({'cycle': cycle, 'head': manifest['head'], 'files': len(manifest['files']), 'overlay': changed})
        delta = subprocess.check_output(['git', '-C', str(WT), 'diff', '--name-only', summary[1]['head'], HEAD], text=True).splitlines()
        self.assertEqual(delta, ['spacedock-bridge/shared/coordinator.ts', 'spacedock-bridge/test/coordinator-switch.test.mts'])
        print('MANIFEST AUDIT', json.dumps(summary), 'runtime overlay bytes deleted; recorded runtime hash alone cannot authenticate overlay contents')

    def test_measurements_match_native_start_end_and_usage(self):
        rows = load('cycle-3', 'model-measurement.json')['turns']
        self.assertEqual(len(rows), 8)
        identities = {(r['daemonGeneration'], r['agentId'], r['turnId']) for r in rows}
        self.assertEqual(len(identities), 8)
        from datetime import datetime
        for r in rows:
            paths = list((EVIDENCE / 'cycle-3').glob('*.jsonl'))
            events = [json.loads(line) for f in paths for line in f.read_text().splitlines()]
            matching = [e for e in events if e.get('agentId') == r['agentId'] and e.get('event', {}).get('turnId') == r['turnId']]
            starts = [e for e in matching if e['event']['type'] == 'turn_started' and e['timestamp'] == r['startedAt']]
            ends = [e for e in matching if e['event']['type'] == 'turn_completed' and e['timestamp'] == r['completedAt']]
            self.assertEqual(len(starts), 1, r)
            self.assertEqual(len(ends), 1, r)
            self.assertEqual(ends[0]['event']['usage'], r['usage'])
            elapsed = (datetime.fromisoformat(r['completedAt'].replace('Z', '+00:00')) - datetime.fromisoformat(r['startedAt'].replace('Z', '+00:00'))).total_seconds()
            self.assertAlmostEqual(elapsed, r['seconds'], places=3)

    def test_cycle_two_is_earlier_relay_proof_with_explicit_lifecycle_hold(self):
        acceptance = load('cycle-2', 'acceptance.json')
        self.assertEqual([r['count'] for r in acceptance['receipts']], [1, 1, 1, 0])
        self.assertTrue(acceptance['backendLifecycle'].startswith('HOLD:'))
        measurement = load('cycle-2', 'model-measurement.json')
        self.assertEqual(len(measurement['turns']), 4)
        self.assertEqual(len(measurement['receiptTurns']), 4)
        self.assertEqual([len(r['messages']) for r in measurement['receiptTurns']], [1, 1, 1, 0])
        for stage in ['list', 'preview']:
            self.assertFalse((EVIDENCE / 'cycle-2' / ('restart-after-' + stage + '.json')).exists())
        for receipt in acceptance['receipts'][:3]:
            self.assertTrue(receipt['exactToolPayloadDelivered'])
            page = load('cycle-2', 'delivered-' + receipt['recipient'] + '-timeline.json')
            incoming = [e for e in page['entries'] if e['item'].get('agentMessage', {}).get('event') == 'message']
            self.assertEqual(len(incoming), 1)
            self.assertEqual(incoming[0]['item']['callId'], 'paseo-agent-message:' + receipt['messageId'])

if __name__ == '__main__':
    unittest.main(verbosity=2)
