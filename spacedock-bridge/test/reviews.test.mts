import assert from "node:assert/strict";
import { test } from "node:test";
import { AUTOMATED_MARKER, newRequests, parseSearch, reviewOwner, wakeMessage } from "../shared/reviews";

const output = JSON.stringify([
  {
    url: "https://github.com/DataRecce/recce-claude-plugin/pull/46",
    number: 46,
    title: "fix(recce-devloop): stop before the upload",
    author: { login: "wcchang1115" },
    repository: { name: "recce-claude-plugin", nameWithOwner: "DataRecce/recce-claude-plugin" },
  },
  { url: "", number: 0, repository: {} },
]);

test("gh search output becomes review requests, dropping incomplete rows", () => {
  const requests = parseSearch(output, 5);
  assert.equal(requests.length, 1);
  assert.deepEqual(requests[0], {
    url: "https://github.com/DataRecce/recce-claude-plugin/pull/46",
    repo: "recce-claude-plugin",
    owner: "DataRecce",
    number: 46,
    title: "fix(recce-devloop): stop before the upload",
    author: "wcchang1115",
    firstSeenAt: 5,
  });
});

test("only requests not seen before are new", () => {
  const requests = parseSearch(output, 5);
  assert.equal(newRequests(requests, {}).length, 1);
  assert.equal(newRequests(requests, { [requests[0].url]: 1 }).length, 0);
});

test("the wake message is marked as automated data and names each pull request", () => {
  const text = wakeMessage(parseSearch(output, 5));
  assert.ok(text.startsWith(AUTOMATED_MARKER));
  assert.match(text, /DataRecce\/recce-claude-plugin#46/);
  assert.match(text, /post nothing on GitHub/);
  assert.match(text, /not a ruling/);
});

test("a review goes to the FO whose next step names it, else to the FO whose repo label lists it", () => {
  const rows = [
    { id: "review-fo", repo: "recce-cloud-infra", task: "recce-pr-review-briefs", next: "Captain decides on recce-claude-plugin#46", offline: false },
    { id: "multi", repo: "a, recce-cloud-infra", task: "", next: "", offline: false },
    { id: "gone", repo: "recce-claude-plugin", task: "", next: "", offline: true },
  ];
  assert.equal(reviewOwner({ repo: "recce-claude-plugin", number: 46 }, rows)?.id, "review-fo");
  assert.equal(reviewOwner({ repo: "recce-cloud-infra", number: 1471 }, rows)?.id, "review-fo");
  assert.equal(reviewOwner({ repo: "a", number: 1 }, rows)?.id, "multi");
  assert.equal(reviewOwner({ repo: "recce-claude-plugin", number: 47 }, rows), undefined);
});
