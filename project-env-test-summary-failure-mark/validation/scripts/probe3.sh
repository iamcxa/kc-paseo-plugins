#!/bin/sh
. /tmp/pe-val-dir/bin/lib.sh
fresh; $A set viewport 1280 1900 >/dev/null 2>&1; $A set media dark >/dev/null 2>&1
reopen; btn Test; sleep 8
r=$(ref_of 'button "POSTHOG_CLI_API_KEY failed'); $A click @$r >/dev/null 2>&1; sleep 0.7
$A eval "(()=>{const R=(e)=>{const b=e.getBoundingClientRect();return [Math.round(b.left),Math.round(b.right),Math.round(b.top),Math.round(b.bottom)]};
const out={};
for (const p of document.querySelectorAll('[aria-label^=\"Field for \"]')) {
  const name=p.getAttribute('aria-label').split(':')[0].replace('Field for ','');
  const tw=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);const tr=[];let nd;while(nd=tw.nextNode()){if(nd.textContent.trim()){const g=document.createRange();g.selectNodeContents(nd);tr.push(Math.round(g.getBoundingClientRect().right))}}
  const textRight=Math.max(...tr);
  out[name]={pill:R(p),textRight};
}
const a=document.querySelector('[role=alert]'); const rg=document.createRange(); rg.selectNodeContents(a);
out.alertTextWidth=Math.round(rg.getBoundingClientRect().width);
const m=document.querySelector('[aria-label*=\" failed. \"]'); out.firstMarkLeft=Math.round(m.getBoundingClientRect().left);
return JSON.stringify(out)})()"
$A screenshot /tmp/pe-val-dir/shots/probe3-open.png >/dev/null 2>&1
