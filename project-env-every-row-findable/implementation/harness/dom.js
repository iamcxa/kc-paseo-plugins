// Shared DOM helpers, injected through `agent-browser eval`. Defines window.__pe once per page load.
window.__pe = {
  bar() { return [...document.querySelectorAll('div')].find(e => getComputedStyle(e).position === 'sticky' && /Save/.test(e.innerText || '')); },
  pill(name) { return [...document.querySelectorAll('[aria-label^="Field for ' + name + ':"]')][0]; },
  row(name) {
    let e = this.pill(name);
    while (e && !(getComputedStyle(e).paddingTop === '14px' && getComputedStyle(e).paddingLeft === '16px')) e = e.parentElement;
    return e;
  },
  gap(name) { const r = this.row(name), b = this.bar(); return Math.round(b.getBoundingClientRect().top - r.getBoundingClientRect().bottom); },
  inView(name) { const r = this.row(name).getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; },
  focused() { const a = document.activeElement; return a ? (a.getAttribute('aria-label') || a.tagName) : null; },
  barH() { return Math.round(this.bar().getBoundingClientRect().height); },
};
'ok'
window.__pe.last = function () { // the last variable row's bottom edge against the bar's top edge
  const pills = [...document.querySelectorAll('[aria-label^="Field for"]')].filter(e => !/Why/.test(e.getAttribute('aria-label')));
  let p = pills[pills.length - 1], r = p;
  while (r && !(getComputedStyle(r).paddingTop === '14px' && getComputedStyle(r).paddingLeft === '16px')) r = r.parentElement;
  const b = this.bar().getBoundingClientRect(), q = r.getBoundingClientRect();
  return { label: p.getAttribute('aria-label'), rowBottom: Math.round(q.bottom), barTop: Math.round(b.top), gap: Math.round(b.top - q.bottom), vh: innerHeight };
};
'ok'
window.__pe.reach = function () { // which row holds focus, and where it sits against the bar
  const f = document.activeElement.getAttribute('aria-label') || '';
  const n = f.replace(/^Field for /, '').split(':')[0];
  return { focused: n, gap: this.gap(n), inView: this.inView(n) };
};
'ok'
window.__pe.wrap = function (name) { // where each line of the variable name starts, and the text a copy would give
  const el = [...document.querySelectorAll('div')].find(e => e.children.length <= 40 && e.textContent === name && !e.querySelector('div'));
  if (!el) return { error: 'name element not found' };
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), chars = [];
  for (let t = w.nextNode(); t; t = w.nextNode()) for (let i = 0; i < t.length; i++) { const r = document.createRange(); r.setStart(t, i); r.setEnd(t, i + 1); const b = r.getBoundingClientRect(); chars.push({ c: t.data[i], top: Math.round(b.top) }); }
  const starts = [];
  chars.forEach((x, i) => { if (i > 0 && x.top > chars[i - 1].top + 4) starts.push({ at: i, after: chars[i - 1].c, line: chars.slice(i).map(y => y.c).join('').slice(0, 12) }); });
  const lines = new Set(chars.map(x => x.top)).size;
  return { text: chars.map(x => x.c).join(''), equal: chars.map(x => x.c).join('') === name, lines, everyStartAfterUnderscore: starts.every(s => s.after === '_'), starts };
};
'ok'
