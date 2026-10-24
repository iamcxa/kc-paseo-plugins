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
  const vault = [...document.querySelectorAll('[role=button]')].find((e) => vis(e) && (e.getAttribute('aria-label') || '').startsWith('Vault'));
  const labelEl = [...document.querySelectorAll('div')].filter((e) => vis(e) && (e.innerText || '').startsWith('Use this connection')).sort((a, b) => a.innerText.length - b.innerText.length)[0];
  const row = labelEl ? labelEl.innerText.split('\n').filter((l) => l.trim() && l.trim() !== 'Cancel' && l.trim() !== 'Done') : null;
  return JSON.stringify({
    viewport: [innerWidth, innerHeight],
    cancel: box(cancel), done: box(done), vault: box(vault), bar: box(bar),
    doneDisabled: done ? (done.getAttribute('aria-disabled') === 'true') : null,
    rowText: row,
  });
})()
