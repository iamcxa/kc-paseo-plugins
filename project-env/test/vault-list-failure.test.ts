import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { vaultListFailure } from "../shared/field-picker.ts";

const wire = (error: string) => `Request failed: ${error} requestType=plugin.rpc.invoke.request code=handler_error`;

describe("the field picker's failure line", () => {
  it("says the list took too long when the daemon timed the call out, and does not send the person to the connection", () => {
    const shown = vaultListFailure(wire("Plugin RPC timed out: paseo-project-env.invoke"));
    assert.equal(shown.message, "Listing this vault took too long.");
    assert.match(shown.hint, /^Type the reference below instead\./);
    assert.doesNotMatch(`${shown.message} ${shown.hint}`, /connection/i);
  });
  it("tells a rate limit to wait, not to fix the connection", () => {
    const shown = vaultListFailure(wire("1Password rate limit reached so wait and try again"));
    assert.equal(shown.message, "1Password rate limit reached so wait and try again");
    assert.equal(shown.hint, "Close this list, wait a while, then open it again.");
  });
  it("keeps today's words for a connection failure", () => {
    assert.deepEqual(vaultListFailure(wire("1Password could not be reached")), {
      message: "1Password could not be reached",
      hint: "Close this list, fix the 1Password connection on this page, then open it again.",
    });
  });
});
