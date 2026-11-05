#!/bin/bash
# Four reruns of the blank-variable scenario (s1-blank) on the new notice sentence, three configs per round.
cd "$(dirname "$0")"
export CHECK_WORK=/tmp/pe-resume-impl/check CODEX_HOME_CHECK=/tmp/pe-resume-impl/codex-home
for r in 1 2 3 4; do
  python3 -I comprehension.py r$r notice-resume.txt out/r$r -- s1-blank
done
