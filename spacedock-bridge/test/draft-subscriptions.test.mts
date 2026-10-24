import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { useDraft } from "../client/use-draft";
import { composerHandlers } from "../shared/composer";
import * as store from "../shared/drafts";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

test("draft subscriptions notify only their target and stop after unsubscribe", () => {
  const key = store.draftKey("subscriptions");
  const values: string[] = [];
  const stop = store.subscribeDraft(key, () => values.push(store.readDraft(key)));
  store.writeDraft(store.draftKey("another-subscription"), "Other draft");
  assert.deepEqual(values, []);
  store.writeDraft(key, "First draft");
  store.writeDraft(key, "First draft");
  store.writeDraft(key, "");
  stop();
  store.writeDraft(key, "After unsubscribe");
  assert.deepEqual(values, ["First draft", ""]);
  store.writeDraft(key, "");
  store.writeDraft(store.draftKey("another-subscription"), "");
});

test("mounted composers follow store updates, target changes and unsubscription", async (t) => {
  const h = mounted(t, "shared-mounts");
  await act(() => h.render("a"));
  await act(() => { store.seedDraft(h.key, "Prefilled question"); });
  assert.equal(h.shown(), "Prefilled question");
  const second = h.addMount();
  await act(() => second.render("b"));
  await act(() => second.editFromComposer());
  assert.equal(h.shown(), "Edit from another mount");
  assert.equal(second.shown(), "Edit from another mount");
  const otherKey = store.draftKey("other-visible-target");
  await act(() => store.writeDraft(otherKey, "Other target"));
  await act(() => second.render("b", otherKey));
  assert.equal(second.shown(), "Other target");
  await act(() => h.edit("Latest first target"));
  assert.equal(h.shown(), "Latest first target");
  assert.equal(second.shown(), "Other target");
  await act(() => second.unmount());
  await act(() => h.edit("After second unmount"));
  assert.equal(h.shown(), "After second unmount");
  store.writeDraft(otherKey, "");
});

for (const action of ["send", "decision"] as const) {
  for (const outcome of ["clear", "edit", "refuse"] as const) {
    test(`mounted composer reflects delayed ${action}: ${outcome}`, async (t) => {
      const h = mounted(t, `${action}-${outcome}`);
      const sent: string[] = [];
      let complete!: (refusal: string | null) => void;
      let started!: () => void;
      const result = new Promise<string | null>((resolve) => { complete = resolve; });
      const dispatched = new Promise<void>((resolve) => { started = resolve; });
      await act(() => h.render("before"));
      await act(() => h.edit("Original reply"));
      const handlers = composerHandlers({
        draft: () => store.readDraft(h.key),
        setDraft: h.edit,
        setError: () => {},
        sending: () => false,
        setSending: () => {},
        beforeSend: async () => { started(); return result; },
        sendToAgent: async (text) => { sent.push(text); },
        onChip: async () => { started(); return result; },
      });
      const pending = action === "send" ? handlers.send() : handlers.chip("要求修改");
      await dispatched;
      await act(() => h.render("remounted"));
      assert.equal(h.shown(), "Original reply");
      if (outcome === "edit") await act(() => h.edit("New reply after remount"));
      await act(async () => { complete(outcome === "refuse" ? "Refused" : null); await pending; });
      const expected = outcome === "clear" ? "" : outcome === "edit" ? "New reply after remount" : "Original reply";
      assert.equal(store.readDraft(h.key), expected);
      assert.equal(h.shown(), expected);
      const next = composerHandlers({
        draft: () => store.readDraft(h.key), setDraft: h.edit, setError: () => {},
        sending: () => false, setSending: () => {},
        sendToAgent: async (text) => { sent.push(text); },
      });
      const before = sent.length;
      await act(async () => { await next.send(); });
      assert.deepEqual(sent.slice(before), expected ? [expected] : []);
      assert.equal(h.shown(), "");
    });
  }
}

for (const failure of [false, true]) {
  test(`reopening a pending send blocks button and Enter until ${failure ? "failure" : "success"}`, async (t) => {
    let settle!: () => void;
    let dispatched!: () => void;
    const result = new Promise<void>((resolve, reject) => {
      settle = () => failure ? reject(new Error("Send failed")) : resolve();
    });
    const started = new Promise<void>((resolve) => { dispatched = resolve; });
    const sent: string[] = [];
    const h = mounted(t, `pending-${failure}`, async (text) => {
      sent.push(text);
      dispatched();
      await result;
    });
    await act(() => h.render("first"));
    await act(() => h.edit("Pending reply"));
    let pending!: Promise<void>;
    let repeated = Promise.resolve();
    await act(() => { pending = h.send(); });
    await started;
    const other = store.draftKey(`other-pending-${failure}`);
    try {
      await act(() => h.render("reopened"));
      assert.equal(h.sendDisabled(), true);
      assert.equal(h.status(), "Sending");
      await act(() => { h.clickSend(); repeated = Promise.resolve(h.enter()); });
      assert.deepEqual(sent, ["Pending reply"]);
      await act(() => store.writeDraft(other, "Other reply"));
      await act(() => h.render("other", other));
      assert.equal(h.sendDisabled(), false);
      await act(() => h.render("back"));
      assert.equal(h.sendDisabled(), true);
      await act(async () => { settle(); await pending; await repeated; });
      assert.equal(h.status(), "Ready");
      assert.equal(h.shown(), failure ? "Pending reply" : "");
      assert.equal(h.sendDisabled(), !failure);
      if (failure) {
        await act(async () => { await h.send(); });
        assert.deepEqual(sent, ["Pending reply", "Pending reply"]);
        assert.equal(h.shown(), "Pending reply");
        assert.equal(h.sendDisabled(), false);
      }
    } finally {
      await act(async () => { settle(); await pending; await repeated; });
      store.writeDraft(other, "");
    }
  });
}

function mounted(t: TestContext, id: string, sendToAgent: (text: string) => Promise<void> = async () => {}) {
  const dom = new JSDOM("<!doctype html><body></body>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  const key = store.draftKey(id);
  const roots: ReturnType<typeof createRoot>[] = [];
  let current!: ReturnType<typeof composerHandlers>;
  function addMount() {
    const container = dom.window.document.createElement("div");
    dom.window.document.body.append(container);
    const root = createRoot(container);
    roots.push(root);
    return {
      render: (mount: string, target = key) => root.render(createElement(Composer, { key: mount, target })),
      shown: () => container.querySelector("textarea")!.value,
      editFromComposer: () => container.querySelector("button")!.click(),
      sendDisabled: () => container.querySelector<HTMLButtonElement>("[data-send]")!.disabled,
      status: () => container.querySelector("output")!.textContent,
      clickSend: () => container.querySelector<HTMLButtonElement>("[data-send]")!.click(),
      unmount: () => { root.unmount(); roots.splice(roots.indexOf(root), 1); },
    };
  }
  function Composer({ target }: { target: string }) {
    const [draft, setDraft, sending, setSending] = useDraft(target);
    current = composerHandlers({
      draft: () => store.readDraft(target), setDraft, setError: () => {},
      sending: () => store.readDraftSending(target), setSending, sendToAgent,
    });
    const send = current.send;
    return createElement("div", null,
      createElement("textarea", { value: draft, readOnly: true }),
      createElement("button", { onClick: () => setDraft("Edit from another mount") }, "Edit"),
      createElement("button", { "data-send": true, disabled: sending || !draft.trim(), onClick: () => { void send(); } }, "↑"),
      createElement("output", null, sending ? "Sending" : "Ready"),
    );
  }
  t.after(async () => {
    await act(() => { for (const root of roots) root.unmount(); });
    store.writeDraft(key, "");
    dom.window.close();
  });
  return {
    key, edit: (text: string) => store.writeDraft(key, text), addMount, ...addMount(),
    send: () => current.send(), enter: () => current.onKeyPress({ nativeEvent: { key: "Enter" } }),
  };
}
