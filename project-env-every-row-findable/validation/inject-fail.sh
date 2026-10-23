. /Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/project-env-every-row-findable/implementation/harness/lib.sh
summary() { ab eval "(()=>{const m=document.body.innerText.match(/(All \d+ set|\d+ failed[^\n]*|Not tested since changes|Testing…|Test failed[^\n]*)/);return m?m[0].replace(/\n/g,' ').trim():'(none)'})()" | tr -d '"'; }
fresh 2 1280 1400; echo "before: $(summary)"; jsclick Test >/dev/null; sleep 3; echo "failing Test: $(summary)"; ab screenshot --full /tmp/pe-rowv2/failed-3.png >/dev/null
view 700 1400; sleep 3; echo "crossed 700: $(summary)"; view 1280 1400; sleep 3; echo "back: $(summary)"
