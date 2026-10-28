#!/bin/bash
# usage: checks.sh <base-url>   AC-1 step 4 checks on the served build
B=${1%/}; S=docs-checks-$$
ab() { agent-browser --session $S "$@"; }
for w in 1280 400; do
  ab set viewport $w 900 >/dev/null; ab open "$B/docs/project-env/reference.html" >/dev/null; ab wait --load networkidle >/dev/null
  echo "reference $w: blank-link visible without scrolling = $(ab eval 'var a=[...document.querySelectorAll("a")].find(a=>a.textContent.trim()=="When a variable is blank"&&a.getAttribute("href")=="#when-a-variable-is-blank"); var r=a.getBoundingClientRect(); r.top>=0&&r.bottom<=innerHeight&&r.width>0') ; target exists = $(ab eval '!!document.getElementById("when-a-variable-is-blank")')"
done
for p in docs/project-env/ docs/project-env/install.html docs/project-env/prepare-1password.html; do
  ab open "$B/$p" >/dev/null; ab wait --load networkidle >/dev/null
  echo "$p: images=$(ab eval 'document.querySelectorAll("main img, .main-content img").length') images-not-in-a-link-to-themselves=$(ab eval '[...document.querySelectorAll(".main-content img")].filter(i=>{var a=i.closest("a");return !a||a.href!==i.src}).length') h1=$(ab eval 'document.querySelector(".main-content h1").textContent')"
done
ab open "$B/docs/project-env/install.html" >/dev/null; ab wait --load networkidle >/dev/null
echo "install: code blocks=$(ab eval 'document.querySelectorAll("div.highlighter-rouge").length') copy buttons=$(ab eval 'document.querySelectorAll("button[aria-label=\"Copy code to clipboard\"]").length')"
ab open "$B/docs/project-env/changelog.html" >/dev/null; ab wait --load networkidle >/dev/null
echo "changelog: list items=$(ab eval 'document.querySelectorAll(".main-content li").length') distinct texts=$(ab eval 'new Set([...document.querySelectorAll(".main-content li")].map(l=>l.textContent.trim())).size') h1=$(ab eval 'document.querySelector(".main-content h1").textContent')"
for p in / docs/project-env/reference.html; do ab open "$B/$p" >/dev/null; ab wait --load networkidle >/dev/null; echo "$p h1=$(ab eval 'document.querySelector(".main-content h1").textContent') title-tag=$(ab eval 'document.title')"; done
ab set viewport 400 900 >/dev/null; ab open "$B/" >/dev/null; ab wait --load networkidle >/dev/null
echo "home 400: plugin names split across lines = $(ab eval '[...document.querySelectorAll(".main-content code")].filter(c=>/^(project-env|spacedock-bridge)$/.test(c.textContent)&&c.getClientRects().length>1).length')"
echo "copy check: built install page text contains plain-hyphen commands: $(curl -s "$B/docs/project-env/install.html" | grep -c 'paseo --version')"
ab set viewport 1280 900 >/dev/null; ab open "$B/" >/dev/null; ab wait --load networkidle >/dev/null; ab wait 1500 >/dev/null
ab fill '#search-input' keychai >/dev/null; ab press n >/dev/null; ab wait 800 >/dev/null
echo "search page label: $(ab eval '(function(){var e=document.querySelector(".search-result-doc-parent .search-result-doc-title");var o=1,n=e;while(n&&n.nodeType==1){o*=parseFloat(getComputedStyle(n).opacity);n=n.parentElement}var c=getComputedStyle(e).color.match(/[\d.]+/g).map(Number);var f=c.map(v=>255+(v-255)*o);var L=a=>{var x=a.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*x[0]+.7152*x[1]+.0722*x[2]};return "opacity "+o+" text "+f.map(Math.round).join(",")+" contrast on white "+(1.05/(L(f)+.05)).toFixed(2)+" to 1"})()')"
ab close >/dev/null
