. /tmp/pe-add-step/lib.sh
P=$1; W=$2; H=$3; O=/tmp/pe-add-step/out
full() { ab screenshot "$O/$P-$1.png" >/dev/null; }
view() { ab screenshot "$O/$P-$1.png" >/dev/null; }
size $W $H; opened; edit_nth 2; sleep 2
full 10-empty-project
click 'button "\+ Add"'; sleep 1.2; view 11-empty-picker
opened; edit_nth 4; sleep 2
click 'button "\+ Add"'; sleep 1.5; fill 'textbox "Search fields"' "linear api key"; view 12-unavailable-picker
