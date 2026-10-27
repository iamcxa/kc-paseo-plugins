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
ab close >/dev/null
