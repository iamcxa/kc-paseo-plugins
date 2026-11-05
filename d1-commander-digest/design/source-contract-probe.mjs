import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.argv[2];
if (!root) throw new Error('Usage: node source-contract-probe.mjs <spacedock-bridge-root>');
const sdk = resolve(root, 'node_modules/@getpaseo');
const { createPaseoApi } = await import(pathToFileURL(resolve(sdk, 'client/dist/index.js')));
const { AgentTimelineEntryPayloadSchema, FetchAgentTimelineResponseMessageSchema } =
  await import(pathToFileURL(resolve(sdk, 'protocol/dist/messages.js')));
const digest = text => createHash('sha256').update(text, 'utf8').digest('hex');
const entry = (seq, text, type = 'assistant_message') => ({
  provider: 'fictional', item: { type, text }, timestamp: '2000-01-01T00:00:00Z',
  seqStart: seq, seqEnd: seq, sourceSeqRanges: [{ startSeq: seq, endSeq: seq }], collapsed: [],
});
const source = { hostId: 'fictional-host', agentId: 'fictional-fo', epoch: 'epoch-a',
  seqStart: 12, seqEnd: 12, textHash: digest('Fictional report: ready for trial.') };
const page = (entries, extras = {}) => ({
  requestId: 'fictional-request', agentId: source.agentId, agent: null, direction: 'after',
  projection: 'canonical', epoch: source.epoch, reset: false, staleCursor: false, gap: false,
  window: { minSeq: 1, maxSeq: 50, nextSeq: 51 }, startCursor: { epoch: source.epoch, seq: 12 },
  endCursor: { epoch: source.epoch, seq: 12 }, hasOlder: true, hasNewer: false, entries,
  error: null, ...extras,
});
const report = entry(12, 'Fictional report: ready for trial.');
const accepts = (hostId, ref, value) => {
  if (hostId !== ref.hostId || value.agentId !== ref.agentId || value.epoch !== ref.epoch ||
      value.reset || value.staleCursor || value.gap || value.error || value.projection !== 'canonical') return false;
  return value.entries.some(e => e.seqStart === ref.seqStart && e.seqEnd === ref.seqEnd &&
    e.item.type === 'assistant_message' && digest(e.item.text) === ref.textHash &&
    e.sourceSeqRanges.length === 1 && e.sourceSeqRanges[0].startSeq === ref.seqStart &&
    e.sourceSeqRanges[0].endSeq === ref.seqEnd);
};
const results = [];
async function check(name, run) {
  try { await run(); results.push({ name, status: 'passed' }); }
  catch (error) { results.push({ name, status: 'failed', message: error.message }); }
}
await check('Installed schema accepts a canonical source with no optional messageId', () => {
  assert.equal(AgentTimelineEntryPayloadSchema.safeParse(report).success, true);
  assert.equal(FetchAgentTimelineResponseMessageSchema.safeParse({
    type: 'fetch_agent_timeline_response', payload: page([report]),
  }).success, true);
  assert.equal(accepts(source.hostId, source, page([report])), true);
});
await check('Public SDK forwards exact agent, canonical projection and epoch cursor', async () => {
  const calls = [];
  const api = createPaseoApi({ fetchAgentTimeline: async (id, options) => {
    calls.push({ id, options }); return page([report]);
  } });
  try {
    const options = { direction: 'after', projection: 'canonical', limit: 50,
      cursor: { epoch: source.epoch, seq: source.seqStart - 1 } };
    const value = await api.agents.ref(source.agentId).timeline.refetch(options);
    assert.deepEqual(calls, [{ id: source.agentId, options }]);
    assert.equal(accepts(source.hostId, source, value), true);
    assert.equal('schedules' in api, false);
    assert.equal('heartbeats' in api, false);
  } finally { await api.dispose(); }
});
await check('Identical text from another FO is rejected', () => {
  assert.equal(accepts(source.hostId, source, page([report], { agentId: 'fictional-other-fo' })), false);
});
await check('Identical text at another sequence is rejected', () => {
  assert.equal(accepts(source.hostId, source, page([entry(23, report.item.text)])), false);
});
await check('Another host and a replaced epoch are rejected', () => {
  assert.equal(accepts('fictional-other-host', source, page([report])), false);
  assert.equal(accepts(source.hostId, source, page([report], { epoch: 'epoch-b' })), false);
});
await check('Reset, stale cursor, gap and missing entry are rejected', () => {
  for (const flag of ['reset', 'staleCursor', 'gap']) {
    assert.equal(accepts(source.hostId, source, page([report], { [flag]: true })), false);
  }
  assert.equal(accepts(source.hostId, source, page([])), false);
});
await check('Changed source bytes, user message and changed source ranges are rejected', () => {
  assert.equal(accepts(source.hostId, source, page([entry(12, 'Fictional changed report.')])), false);
  assert.equal(accepts(source.hostId, source, page([entry(12, report.item.text, 'user_message')])), false);
  assert.equal(accepts(source.hostId, source, page([{ ...report,
    sourceSeqRanges: [{ startSeq: 12, endSeq: 13 }],
  }])), false);
});
await check('A later page can resolve the exact reference without a text search', async () => {
  const calls = [];
  const api = createPaseoApi({ fetchAgentTimeline: async (id, options) => {
    calls.push(options.cursor.seq);
    return options.cursor.seq === 10
      ? page([entry(11, 'Fictional unrelated report.')], {
          hasNewer: true, endCursor: { epoch: source.epoch, seq: 11 },
        }) : page([report]);
  } });
  try {
    let cursor = { epoch: source.epoch, seq: 10 };
    let found = false;
    for (let reads = 0; reads < 2; reads++) {
      const value = await api.agents.ref(source.agentId).timeline.refetch({
        direction: 'after', projection: 'canonical', cursor, limit: 1,
      });
      if (value.epoch !== source.epoch || value.reset || value.staleCursor || value.gap) break;
      if (accepts(source.hostId, source, value)) { found = true; break; }
      if (!value.hasNewer || !value.endCursor || value.endCursor.seq <= cursor.seq) break;
      cursor = value.endCursor;
    }
    assert.equal(found, true);
    assert.deepEqual(calls, [10, 11]);
  } finally { await api.dispose(); }
});
console.log(JSON.stringify(results, null, 2));
if (results.some(result => result.status === 'failed')) process.exitCode = 1;
