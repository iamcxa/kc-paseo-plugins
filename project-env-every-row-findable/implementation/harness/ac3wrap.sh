#!/bin/bash
# AC-3 clauses 2 and 3: where each line of the 54-character name starts, its copied text, and the open ≠ explanation. $1 = width, $2 = height
. "$(dirname "$0")/lib.sh"
W=${1:-1280}; H=${2:-1400}
N=DATABASE_URL_FOR_THE_PRODUCTION_REPLICA_READ_ONLY_USER
fresh 2 $W $H
ab eval "(()=>{const d=__pe.wrap('$N');return '[${W}] name: lines='+d.lines+' copiedTextEqualsName='+d.equal+' everyLineStartsAfterUnderscore='+d.everyStartAfterUnderscore+' lineStarts='+d.starts.map(s=>s.line).join(',')})()" | tr -d '"'
r=$(ref "Why STRIPE_KEY is marked different"); ab click "@$r" >/dev/null; sleep 1
ab eval "(()=>{const t=[...document.querySelectorAll('div,span')].filter(e=>!e.querySelector('div')&&/^The field name differs/.test(e.textContent.trim())).map(e=>e.textContent.trim());return '[${W}] explanation: '+JSON.stringify(t[0]||'(not shown)')})()" | tr -d '\\' | sed 's/^"//; s/"$//'
