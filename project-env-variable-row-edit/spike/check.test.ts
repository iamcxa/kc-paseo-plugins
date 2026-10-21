import assert from "node:assert/strict";
import { it } from "node:test";
import { isReservedName, refusal, reservedReason, splitImported } from "/tmp/variable-row-edit-spike-r15/plugin/shared/config.ts";
it("table", () => {
  for (const n of ["PATH","HOME","NODE_OPTIONS","OP_SERVICE_ACCOUNT_TOKEN","PASEO_AGENT_ID","CLAUDECODE","LD_PRELOAD","DYLD_INSERT_LIBRARIES","DYLD_"]) assert.ok(refusal(n, []), n);
  for (const n of ["DATABASE_URL","LD_LIBRARY_PATH","path","ANTHROPIC_API_KEY","DYLDX"]) assert.equal(refusal(n, []), null, n);
  assert.match(refusal("A", ["A"])!, /already/);
  assert.match(refusal("1A", [])!, /letters/);
  assert.equal(refusal("", []), null);
  assert.equal(isReservedName("PATH"), true);
  assert.deepEqual(splitImported(["PATH","X","LD_PRELOAD","Y"], ["Y"]), { add: ["X"], skipped: [{name:"PATH",reason:reservedReason("PATH")},{name:"LD_PRELOAD",reason:reservedReason("LD_PRELOAD")}] });
});
