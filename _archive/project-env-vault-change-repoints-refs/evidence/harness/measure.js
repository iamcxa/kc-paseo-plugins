(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const btns = (t) => [...document.querySelectorAll('[role=button]')].filter((e) => vis(e) && (e.innerText || '').trim() === t);
  const box = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) }; };
  const cancel = btns('Cancel').pop();
  const done = btns('Done').pop();
  const save = btns('Save').pop();
  let bar = null;
  for (let e = save; e && e !== document.body; e = e.parentElement) {
    const p = getComputedStyle(e).position;
    if (p === 'sticky' || p === 'fixed' || p === 'absolute') { bar = e; break; }
  }
  const pills = [...document.querySelectorAll('[aria-label^="Field for"]')].filter(vis).map((e) => {
    const cs = getComputedStyle(e);
    return { rect: box(e), label: e.getAttribute('aria-label'), borderColor: cs.borderTopColor, borderStyle: cs.borderTopStyle, borderWidth: cs.borderTopWidth, outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor + ' off ' + cs.outlineOffset, focused: document.activeElement === e };
  });
  return JSON.stringify({
    viewport: [innerWidth, innerHeight],
    cancel: box(cancel), done: box(done), bar: box(bar),
    clearance: (done && bar) ? bar.getBoundingClientRect().top - done.getBoundingClientRect().bottom : null,
    pills,
  });
})()
