A=/tmp/pe-tsfm-impl/bin/ab.sh
URL=$(cat /tmp/pe-tsfm-impl/url)
ref_of() { $A snapshot -i 2>&1 | grep -m1 "$1" | grep -o "ref=e[0-9]*" | head -1 | cut -d= -f2; }
btn() { r=$(ref_of "button \"$1\""); [ -n "$r" ] || { echo "NOREF $1"; return 1; }; $A click @$r >/dev/null 2>&1 || echo "BTN FAIL $1"; sleep 0.8; }
reopen() { $A open $URL >/dev/null 2>&1; sleep 3.5; btn Edit; sleep 1.5; }
pick() { r=$(ref_of "button \"Field for $1:"); [ -n "$r" ] || { echo "NOREF pill $1"; return 1; }; $A click @$r >/dev/null 2>&1; for i in 1 2 3 4 5 6 7 8 9 10; do sleep 1; r=$(ref_of "button \"$2\""); [ -n "$r" ] && break; done; [ -n "$r" ] || { echo "NOPICK $2"; return 1; }; $A click @$r >/dev/null 2>&1; sleep 0.8; }
fresh() { $A close >/dev/null 2>&1; sleep 1.5; }
