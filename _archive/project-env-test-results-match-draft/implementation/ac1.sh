. /tmp/pe-t4-impl/lib.sh
refbox() { $A snapshot -i 2>&1 | grep 'textbox "op://vault/item/field"' | sed -n "$1p" | grep -o "ref=e[0-9]*" | cut -d= -f2; }
test_and_wait() { btn Test; sleep 7.5; echo "  after Test:   $(results)"; }
build >/dev/null 2>&1
# vault menu may need a second attempt
if ! has 'Vault: V'; then r=$(ref_of 'button "Vault: '); $A click @$r >/dev/null; sleep 1; m=$(ref_of 'menuitem "V"'); $A click @$m >/dev/null; sleep 1.2; fi
fill_refs
echo "== control: Test with no edit"; test_and_wait
echo "== 1 change the account"; test_and_wait
fill "1Password service account" sa-b; sleep 1; echo "  after change: $(results)"
fill "1Password service account" sa-a; sleep 1.5
echo "== 2 change the vault"; test_and_wait
menu_pick "Vault: " W; echo "  after change: $(results)"
menu_pick "Vault: " V
echo "== 3 edit a reference"; test_and_wait
$A fill @$(refbox 1) "op://V/api/keyx" >/dev/null; sleep 0.8; echo "  after change: $(results)"
$A fill @$(refbox 1) "op://V/api/key" >/dev/null; sleep 0.8; echo "  after editing back to the same text: $(results)"
echo "== 4 add a variable"; test_and_wait
fill "New variable name" EXTRA; btn Add; echo "  after change: $(results)"
echo "== 5 remove a variable"; test_and_wait
btn "Remove EXTRA"; echo "  after change: $(results)"
echo "== 6 edit the prompt only (not a Test input)"; test_and_wait
r=$(ref_of 'textbox "Appended'); $A fill @$r "hello" >/dev/null; sleep 0.8; echo "  after prompt edit: $(results)"
echo "== 7 edit a reference while Test is running"
btn Test; sleep 1; $A fill @$(refbox 1) "op://V/api/keyx" >/dev/null; sleep 8; echo "  after Test finished: $(results)  (Test button: $($A snapshot -i 2>&1 | grep -o 'button "Test[^"]*"' | head -1))"
echo "== 8 control: Test, no edit while running"; $A fill @$(refbox 1) "op://V/api/key" >/dev/null; sleep 0.5; btn Test; sleep 8; echo "  after Test finished: $(results)"
