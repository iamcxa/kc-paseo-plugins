import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.argv[2];
if (!root) throw new Error('Usage: node context-window-probe.mjs <spacedock-bridge-root>');
const { createPaseoApi } = await import(pathToFileURL(resolve(root, 'node_modules/@getpaseo/client/dist/index.js')));
const { AgentTimelineEntryPayloadSchema } = await import(pathToFileURL(resolve(root, 'node_modules/@getpaseo/protocol/dist/messages.js')));
const hash = text => createHash('sha256').update(text, 'utf8').digest('hex');
const identity = { hostId: 'fictional-host', agentId: 'fictional-fo', epoch: 'epoch-one' };
const entries = Array.from({ length: 9 }, (_, i) => ({
  provider: 'fictional', item: { type: i % 2 ? 'user_message' : 'assistant_message', text: `Fictional exact entry ${i + 1}` },
  timestamp: '2000-01-01T00:00:00Z', seqStart: i + 1, seqEnd: i + 1,
  sourceSeqRanges: [{ startSeq: i + 1, endSeq: i + 1 }], collapsed: [],
}));
const ref = seq => ({ ...identity, seqStart: seq, seqEnd: seq, textHash: hash(entries[seq - 1].item.text) });
const anchor = ref(5);
const page = items => ({ ...identity, entries: items, projection: 'canonical', reset: false, staleCursor: false, gap: false });
const exact = (reference, value) => reference.hostId === value.hostId && reference.agentId === value.agentId &&
  reference.epoch === value.epoch && !value.reset && !value.staleCursor && !value.gap && value.projection === 'canonical' &&
  value.entries.some(entry => entry.seqStart === reference.seqStart && entry.seqEnd === reference.seqEnd &&
    entry.item.type === 'assistant_message' && hash(entry.item.text) === reference.textHash);
const context = [1, 3, 7].map((seq, i) => ({ kind: ['about', 'before', 'now'][i], sentence: `Fictional context line ${i}`, refs: [ref(seq)] }));
const contextsValid = lines => lines.length === 3 && lines.every(line => line.refs?.length && line.refs.every(reference => exact(reference, page(entries))));
const windowValid = (reference, value) => exact(reference, value) && value.entries.every((entry, index, all) =>
  AgentTimelineEntryPayloadSchema.safeParse(entry).success && (index === 0 || entry.seqStart === all[index - 1].seqEnd + 1));
const results = [];
async function check(name, run) {
  try { await run(); results.push({ name, status: 'passed' }); }
  catch (error) { results.push({ name, status: 'failed', message: error.message }); }
}
await check('Every context line owns an exact source, not merely the digest point source', () => {
  assert.equal(contextsValid(context), true);
  assert.equal(contextsValid(context.map(({ refs, ...line }) => line)), false);
});
await check('Context refs from another FO, epoch or changed bytes are rejected', () => {
  for (const change of [{ agentId: 'another-fo' }, { epoch: 'replaced' }, { textHash: hash('changed') }]) {
    const invalid = structuredClone(context); Object.assign(invalid[0].refs[0], change);
    assert.equal(contextsValid(invalid), false);
  }
});
await check('SDK forwards same-FO canonical before and after cursors independently', async () => {
  const calls = [];
  const api = createPaseoApi({ fetchAgentTimeline: async (id, options) => {
    calls.push({ id, ...options });
    return page(options.direction === 'before' ? entries.slice(2, 4) : entries.slice(5, 7));
  } });
  try {
    const handle = api.agents.ref(identity.agentId).timeline;
    await handle.refetch({ projection: 'canonical', direction: 'before', cursor: { epoch: identity.epoch, seq: anchor.seqStart }, limit: 2 });
    await handle.refetch({ projection: 'canonical', direction: 'after', cursor: { epoch: identity.epoch, seq: anchor.seqEnd }, limit: 2 });
    assert.deepEqual(calls.map(call => [call.id, call.projection, call.direction, call.cursor, call.limit]), [
      [identity.agentId, 'canonical', 'before', { epoch: identity.epoch, seq: 5 }, 2],
      [identity.agentId, 'canonical', 'after', { epoch: identity.epoch, seq: 5 }, 2],
    ]);
  } finally { await api.dispose(); }
});
await check('Window preserves exact before/source/after order and user roles', () => {
  const value = page(entries.slice(2, 7));
  assert.equal(windowValid(anchor, value), true);
  assert.deepEqual(value.entries.map(entry => entry.seqStart), [3, 4, 5, 6, 7]);
  assert.deepEqual(value.entries.map(entry => entry.item.type), ['assistant_message', 'user_message', 'assistant_message', 'user_message', 'assistant_message']);
});
await check('Other-host or other-FO windows and gaps cannot be stitched', () => {
  for (const change of [{ hostId: 'other-host' }, { agentId: 'other-fo' }, { epoch: 'other-epoch' }, { gap: true }, { reset: true }, { staleCursor: true }]) {
    assert.equal(windowValid(anchor, { ...page(entries.slice(2, 7)), ...change }), false);
  }
  assert.equal(windowValid(anchor, page([entries[2], entries[4], entries[6]])), false);
});
await check('Missing source cannot be replaced by available neighboring entries', () => {
  assert.equal(windowValid(anchor, page(entries.filter(entry => entry.seqStart !== 5))), false);
});
await check('More-before uses the outer cursor and retains sequence identity', async () => {
  const calls = [];
  const api = createPaseoApi({ fetchAgentTimeline: async (id, options) => {
    calls.push(options.cursor.seq);
    return page(options.cursor.seq === 3 ? entries.slice(0, 2) : []);
  } });
  try {
    const current = entries.slice(2, 7);
    const older = await api.agents.ref(identity.agentId).timeline.refetch({ projection: 'canonical', direction: 'before', cursor: { epoch: identity.epoch, seq: current[0].seqStart }, limit: 2 });
    const combined = [...older.entries, ...current];
    assert.deepEqual(calls, [3]);
    assert.deepEqual(combined.map(entry => entry.seqStart), [1, 2, 3, 4, 5, 6, 7]);
    assert.equal(windowValid(anchor, page(combined)), true);
  } finally { await api.dispose(); }
});
console.log(JSON.stringify(results, null, 2));
if (results.some(result => result.status === 'failed')) process.exitCode = 1;
