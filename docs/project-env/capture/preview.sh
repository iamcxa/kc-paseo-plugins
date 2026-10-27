#!/bin/bash
# usage: preview.sh <base-url> <out-dir> [query]   served address including /kc-paseo-plugins, then a folder for the pictures
# Whole-page pictures of each built page at 1280 and 400 px, the open phone menu, search results, and the 400 px scrollWidth of every page.
B=${1%/}; O=$2; Q=${3:-keychain}; S=docs-preview-$$
mkdir -p "$O"; : > "$O/scrollwidth.txt"
ab() { agent-browser --session $S "$@"; }
for w in 1280 400; do
  ab set viewport $w 900 >/dev/null
  for p in "home:/" "intro:/docs/project-env/" "install:/docs/project-env/install.html" "prepare:/docs/project-env/prepare-1password.html" "reference:/docs/project-env/reference.html" "changelog:/docs/project-env/changelog.html"; do
    n=${p%%:*}; u=${p#*:}
    ab open "$B$u" >/dev/null; ab wait --load networkidle >/dev/null
    ab screenshot --full "$O/$n-$w.png" >/dev/null
    echo "$n $w scrollWidth=$(ab eval 'document.documentElement.scrollWidth')" >> "$O/scrollwidth.txt"
  done
done
ab open "$B/" >/dev/null; ab wait --load networkidle >/dev/null
ab click '.site-button' >/dev/null; ab screenshot "$O/menu-open-400.png" >/dev/null
search() { # <width> <name> <query>
  ab set viewport $1 900 >/dev/null; ab open "$B/" >/dev/null; ab wait --load networkidle >/dev/null
  [ $1 = 400 ] && ab click '.site-button' >/dev/null
  ab wait 1500 >/dev/null
  ab fill '#search-input' "${3%?}" >/dev/null; ab press "${3: -1}" >/dev/null; ab wait 800 >/dev/null
  ab screenshot "$O/$2-$1.png" >/dev/null
}
for w in 1280 400; do
  search $w search "$Q"
  search $w search-cause "rejected the token"
  search $w search-none "zzzzqx"
done
for w in 700 900; do
  ab set viewport $w 900 >/dev/null
  for u in / /docs/project-env/ /docs/project-env/install.html /docs/project-env/prepare-1password.html /docs/project-env/reference.html /docs/project-env/changelog.html; do
    ab open "$B$u" >/dev/null; ab wait --load networkidle >/dev/null
    echo "$w $u scrollWidth=$(ab eval 'document.documentElement.scrollWidth')" >> "$O/scrollwidth.txt"
  done
  ab open "$B/docs/project-env/install.html" >/dev/null; ab wait --load networkidle >/dev/null
  ab screenshot --full "$O/install-$w.png" >/dev/null
  ab click '.site-button' >/dev/null 2>&1; ab screenshot "$O/install-menu-$w.png" >/dev/null 2>&1
done
ab close >/dev/null
cat "$O/scrollwidth.txt"
