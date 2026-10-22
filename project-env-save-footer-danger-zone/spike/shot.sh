#!/bin/sh
# usage: shot.sh name  (screenshot into shots/)
/tmp/save-footer-spike/ab.sh screenshot /tmp/save-footer-spike/shots/$1.png >/dev/null && echo $1
