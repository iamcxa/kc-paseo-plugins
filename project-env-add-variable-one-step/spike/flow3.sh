. /tmp/pe-add-step/lib.sh
P=$1; W=$2; H=$3; O=/tmp/pe-add-step/out
view() { ab screenshot "$O/$P-$1.png" >/dev/null; }
size $W $H; opened; edit_nth 3; sleep 2
view 13-many-rows
click 'button "\+ Add"'; sleep 3
fill 'textbox "Search fields"' "!!!"; view 14-typed-symbols-only
fill 'textbox "Search fields"' "publish"; sleep 1
click 'button "stripe Publishable key"'; sleep 1; view 15-many-rows-new-row-in-view
