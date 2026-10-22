(() => {
  const rect = (e) => { const b = e.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom) }; };
  const hit = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
  const alert = document.querySelector('[role="alert"]');
  if (!alert) return JSON.stringify({ open: false });
  let el = alert, own = null; while (el && !(own = el.querySelector('[aria-label*=" failed. "]'))) el = el.parentElement;
  const ownName = (own.getAttribute('aria-label').split(' failed. ')[0]);
  const a = rect(alert);
  const NAMES = ["SENTRY_PROJECT","SENTRY_AUTH_TOKEN","STRIPE_KEY","TWILIO_ACCOUNT_SID","POSTHOG_CLI_HOST","POSTHOG_CLI_API_KEY"];
  const covered = [];
  for (const e of document.querySelectorAll('div,span')) {
    if (e.children.length === 0 && NAMES.includes(e.textContent.trim()) && e.textContent.trim() !== ownName && hit(a, rect(e))) covered.push('name ' + e.textContent.trim());
  }
  for (const e of document.querySelectorAll('[aria-label*=" failed. "]')) if (e !== own && hit(a, rect(e))) covered.push('mark ' + e.getAttribute('aria-label').split(' ')[0]);
  for (const e of document.querySelectorAll('[aria-label^="Field for "]')) if (e.getAttribute('aria-label') !== 'Field for ' + ownName && hit(a, rect(e))) covered.push('pill ' + e.getAttribute('aria-label'));
  for (const e of document.querySelectorAll('[aria-label^="Remove "]')) if (e.getAttribute('aria-label') !== 'Remove ' + ownName && hit(a, rect(e))) covered.push('remove ' + e.getAttribute('aria-label'));
  const ownPillEl = document.querySelector('[aria-label^="Field for ' + ownName + ':"]');
  const ownPill = rect(ownPillEl);
  const r = document.createRange(); r.selectNodeContents(alert);
  const lines = new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size;
  const pillText = [...ownPillEl.querySelectorAll('div,span')].filter((e) => e.children.length === 0 && e.textContent.trim()).map((e) => rect(e));
  const pillTextCovered = pillText.filter((t) => hit(a, t)).length;
  return JSON.stringify({ open: true, own: ownName, text: alert.textContent, reason: a, ownPill, lines, ownFieldTextCoveredByReason: pillTextCovered, coversOtherRows: covered });
})()
