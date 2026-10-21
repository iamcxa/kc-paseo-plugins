A=/tmp/pe-t4-impl/ab
URL=http://127.0.0.1:6841/settings/hosts/srv_cecMeOvPE3ki/plugins/pe-t4-impl/projects
ref_of() { $A snapshot -i 2>&1 | grep -m1 "$1" | grep -o "ref=e[0-9]*" | head -1 | cut -d= -f2; }
fill() { r=$(ref_of "textbox \"$1\""); [ -n "$r" ] || { echo "NOREF $1"; return 1; }; $A fill @$r "$2" >/dev/null 2>&1 || echo "FILL FAIL $1"; sleep 0.4; }
btn() { r=$(ref_of "button \"$1\""); [ -n "$r" ] || { echo "NOREF $1"; return 1; }; $A click @$r >/dev/null 2>&1 || echo "BTN FAIL $1"; sleep 0.6; }
reopen() {
  $A open $URL >/dev/null 2>&1; sleep 3
  $A find text "Choose…" click >/dev/null 2>&1; sleep 1.5
  r=$(ref_of 'menuitem "work"'); $A click @$r >/dev/null 2>&1; sleep 2
}
menu_pick() { r=$(ref_of "button \"$1"); $A click @$r >/dev/null 2>&1; sleep 1; m=$(ref_of "menuitem \"$2\""); $A click @$m >/dev/null 2>&1; sleep 1.2; }
has() { $A snapshot 2>&1 | grep -q -F -- "$1"; }
n_of() { $A snapshot 2>&1 | grep -c -F -- "$1"; }
results() { echo "set=$(n_of 'StaticText "set"') empty=$(n_of 'failed: the 1Password field is empty') total_failed=$(n_of 'failed:')"; }
build() {
  reopen; fill "1Password service account" sa-a; sleep 2; menu_pick "Vault: " V
  for n in API_KEY BLANK_ONE SPACES_ONE DB_URL; do fill "New variable name" "$n"; btn Add; done
  fill API_KEY "op://V/api/key"; fill BLANK_ONE "op://V/api/blank"; fill SPACES_ONE "op://V/api/spaces"; fill DB_URL "op://V/db/url"
}
fill_refs() {
  set -- $($A snapshot -i 2>&1 | grep 'textbox "op://vault/item/field"' | grep -o "ref=e[0-9]*" | cut -d= -f2)
  $A fill @$1 "op://V/api/key" >/dev/null; $A fill @$2 "op://V/api/blank" >/dev/null; $A fill @$3 "op://V/api/spaces" >/dev/null; $A fill @$4 "op://V/db/url" >/dev/null; sleep 0.5
}
