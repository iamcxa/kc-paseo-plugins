import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import type { KeyboardEvent } from "react-native";
import type { PluginScreenProps } from "@getpaseo/plugin/client";
import { useComposerPadding } from "../client/use-composer-padding";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

for (const scenario of ["already visible at mount", "frame changes without a show event"] as const) {
  test(`native composer follows a keyboard ${scenario}`, async () => {
    const dom = new JSDOM("<!doctype html><body><div></div></body>");
    Object.assign(globalThis, { window: dom.window, document: dom.window.document });
    const container = dom.window.document.querySelector("div")!;
    const root = createRoot(container);
    const listeners = new Map<string, (event: KeyboardEvent) => void>();
    const initialHeight = scenario === "already visible at mount" ? 284 : 0;
    const keyboard = {
      metrics: () => ({ height: initialHeight, width: 360, screenX: 0, screenY: 780 - initialHeight }),
      addListener: ((name, listener) => {
        listeners.set(name, listener);
        return { remove: () => { listeners.delete(name); } };
      }) as Parameters<typeof useComposerPadding>[1]["addListener"],
    };
    const rendered: number[] = [];
    function Column() {
      const paddingBottom = useComposerPadding({ compact: true, platform: "android" }, keyboard);
      rendered.push(paddingBottom);
      return createElement("div", { style: { paddingBottom } });
    }
    try {
      await act(() => root.render(createElement(Column)));
      if (scenario === "already visible at mount") {
        assert.equal(rendered[0], 284);
        assert.equal((container.firstChild as HTMLElement).style.paddingBottom, "284px");
      } else {
        await act(() => listeners.get("keyboardDidChangeFrame")?.({
          duration: 0, easing: "keyboard",
          endCoordinates: { height: 316, width: 360, screenX: 0, screenY: 464 },
        }));
        assert.equal((container.firstChild as HTMLElement).style.paddingBottom, "316px");
      }
    } finally {
      await act(() => root.unmount());
      dom.window.close();
    }
    assert.equal(listeners.size, 0);
  });
}

test("mounted native layout follows keyboard height, replaces Android clearance, and removes listeners", async () => {
  const dom = new JSDOM("<!doctype html><body><div></div></body>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  const container = dom.window.document.querySelector("div")!;
  const root = createRoot(container);
  const listeners = new Map<string, (event: KeyboardEvent) => void>();
  let removed = 0;
  const keyboard: Parameters<typeof useComposerPadding>[1] = {
    addListener: (name, listener) => {
      listeners.set(name, listener);
      return { remove: () => { removed++; listeners.delete(name); } };
    },
  };
  function Column({ layout }: { layout: PluginScreenProps["layout"] }) {
    const paddingBottom = useComposerPadding(layout, keyboard);
    return createElement("div", { style: { paddingBottom } });
  }
  const render = async (platform: PluginScreenProps["layout"]["platform"], compact = true) => {
    await act(() => root.render(createElement(Column, { layout: { compact, platform } })));
  };
  const padding = () => (container.firstChild as HTMLElement).style.paddingBottom;
  const show = async (height: number) => {
    await act(() => listeners.get("keyboardDidShow")?.({ endCoordinates: { height } } as KeyboardEvent));
  };
  try {
    await render("android");
    assert.equal(padding(), "20px");
    assert.deepEqual([...listeners.keys()], ["keyboardDidShow", "keyboardDidHide", "keyboardDidChangeFrame"]);
    await show(284);
    assert.equal(padding(), "284px");
    await show(316);
    assert.equal(padding(), "316px");
    await act(() => listeners.get("keyboardDidHide")?.({} as KeyboardEvent));
    assert.equal(padding(), "20px");
    await render("android", false);
    assert.equal(padding(), "0px");
    await show(240);
    assert.equal(padding(), "240px");
    await render("web");
    assert.equal(padding(), "0px");
    assert.equal(listeners.size, 0);
    assert.equal(removed, 3);
    await render("ios");
    assert.equal(padding(), "0px");
    await show(301);
    assert.equal(padding(), "301px");
  } finally {
    await act(() => root.unmount());
    dom.window.close();
  }
  assert.equal(listeners.size, 0);
  assert.equal(removed, 6);
});
