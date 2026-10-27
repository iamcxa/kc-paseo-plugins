import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

test("review reader exposes the existing poller's scheduled first check and clears it on stop", async (t) => {
  const home = await mkdtemp(join(tmpdir(), "bridge-review-schedule-"));
  t.after(() => rm(home, { recursive: true, force: true }));
  const script = `
    import assert from 'node:assert/strict';
    const { startReviewPoller, readReviewsHandler } = await import('./server/reviews.ts');
    const timers = [];
    Date.now = () => 100000;
    globalThis.setTimeout = (_callback, delay) => { timers.push(delay); return 1; };
    globalThis.setInterval = (_callback, delay) => { timers.push(delay); return 2; };
    globalThis.clearTimeout = () => {};
    globalThis.clearInterval = () => {};
    assert.equal((await readReviewsHandler()).nextCheckAt, null);
    const stop = startReviewPoller(() => null);
    assert.equal((await readReviewsHandler()).nextCheckAt, 130000);
    assert.deepEqual(timers, [30000, 300000]);
    stop();
    assert.equal((await readReviewsHandler()).nextCheckAt, null);
  `;
  const result = spawnSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", script], {
    cwd: new URL("..", import.meta.url), env: { ...process.env, HOME: home }, encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
});
