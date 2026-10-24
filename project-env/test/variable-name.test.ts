import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isReservedName,
  newVariable,
  project,
  refusal,
  reservedReason,
} from "../shared/config.ts";

const ADR_0004_NAMES = [
  "PATH",
  "HOME",
  "NODE_OPTIONS",
  "OP_SERVICE_ACCOUNT_TOKEN",
  "PASEO_AGENT_ID",
  "PASEO_AGENT_CWD",
  "PASEO_NODE_ENV",
  "PASEO_DESKTOP_MANAGED",
  "PASEO_SUPERVISED",
  "ELECTRON_RUN_AS_NODE",
  "ELECTRON_NO_ATTACH_CONSOLE",
  "ESBUILD_BINARY_PATH",
  "CLAUDECODE",
  "CLAUDE_CODE_ENTRYPOINT",
  "CLAUDE_CODE_SSE_PORT",
  "CLAUDE_AGENT_SDK_VERSION",
];

describe("Add refuses a reserved name and says why", () => {
  for (const name of [...ADR_0004_NAMES, "LD_PRELOAD", "DYLD_INSERT_LIBRARIES", "DYLD_LIBRARY_PATH"]) {
    it(`refuses ${name}`, () => {
      const reason = reservedReason(name);
      assert.ok(reason && reason.length > 0);
      const message = refusal(name, []);
      assert.ok(message?.startsWith(`${name} is reserved: ${reason}`));
      assert.equal(isReservedName(name), true);
    });
  }

  it("leaves names a person may set on purpose", () => {
    for (const name of ["DATABASE_URL", "LD_LIBRARY_PATH", "ANTHROPIC_API_KEY", "path", "DYLDX"]) {
      assert.equal(refusal(name, []), null, name);
      assert.equal(isReservedName(name), false, name);
    }
  });

  it("gives a duplicate and a bad shape their own reason, and an empty name none", () => {
    assert.match(refusal("A", ["A"]) ?? "", /already in this project/);
    assert.match(refusal("1A", []) ?? "", /not starting with a digit/);
    assert.match(refusal("A-B", []) ?? "", /letters, digits and underscores/);
    assert.equal(refusal("", ["A"]), null);
  });
});

describe("a variable with no field picked", () => {
  it("starts with no guessed reference and the settings schema accepts it", () => {
    assert.equal(newVariable("LINEAR_API_KEY").ref, "");
    const parsed = project.safeParse({ root: "/r", variables: [newVariable("LINEAR_API_KEY")] });
    assert.equal(parsed.success, true);
  });

  it("still rejects a reference that is not a 1Password reference", () => {
    assert.equal(project.safeParse({ root: "/r", variables: [{ name: "X", ref: "vault/item" }] }).success, false);
  });
});
