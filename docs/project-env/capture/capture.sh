#!/bin/bash
# Retake the project-env documentation pictures against an isolated Paseo with fake op and security.
# Needs: paseo, agent-browser, python3 with Pillow. Usage: capture.sh <out-dir> <work-dir> <port>
# Takes project-env from the repository that holds this script; <work-dir> is rebuilt, so give it an empty or earlier capture directory.
set -e
OUT=${1:?out dir}; export S=${2:?work dir} PORT=${3:?port}
. "$(dirname "$0")/env.sh"
mkdir -p "$OUT/raw"
ref() { ab snapshot -i 2>&1 | grep -F "$1" | head -1 | sed -E 's/.*ref=(e[0-9]+)\].*/\1/'; }
press() { local r; r=$(ref "$1"); [ -n "$r" ] || { echo "no control: $1"; exit 1; }; ab click "@$r" >/dev/null; ab wait "${2:-1200}" >/dev/null; }
bash "$HERE/setup.sh" "$S" "$PORT" >/dev/null
ab close >/dev/null 2>&1 || true
ab open about:blank >/dev/null; ab set viewport 1280 900 >/dev/null
ab open "http://127.0.0.1:$PORT/settings/plugins" >/dev/null; ab wait 2500 >/dev/null
press 'button "Plugins"'
ab screenshot "$OUT/raw/01.png" >/dev/null
press 'switch "Enable plugins"' 4000
press 'Actions for paseo-project-env' 700
ab screenshot "$OUT/raw/02.png" >/dev/null
press 'menuitem "Project environment"' 2500
press 'Add a project' 600
ab screenshot "$OUT/raw/03.png" >/dev/null
press 'menuitem "shop-api"' 2500
ab screenshot "$OUT/raw/04.png" >/dev/null
r=$(ref 'textbox "1Password service account"'); ab fill "@$r" "agent-shop-api-dev-read" >/dev/null; ab wait 400 >/dev/null
press 'button "Check"' 2500
press '"+ Add"' 1800
ab screenshot "$OUT/raw/05.png" >/dev/null
press 'sentry SENTRY_AUTH_TOKEN'
press '"+ Add"' 1800; press 'stripe STRIPE_SECRET_KEY'
press '"+ Add"' 1800; press 'posthog POSTHOG_API_KEY'
press '"+ Add"' 1800; press 'Type a reference'
r=$(ref 'textbox "Reference"'); ab fill "@$r" "op://agent-shop-api-dev/linear/LINEAR_API_KEY" >/dev/null; ab wait 400 >/dev/null
press 'Use reference' 1200
press 'button "Save"' 2500
press 'button "Edit"' 2500
ab screenshot "$OUT/raw/06.png" >/dev/null
press 'button "Test"' 3000
ab screenshot "$OUT/raw/07.png" >/dev/null
python3 - "$OUT" <<'P'
import sys
from PIL import Image
o=sys.argv[1]
def crop(src,dst,box): Image.open(f"{o}/raw/{src}.png").crop(box).save(f"{o}/{dst}.png")
crop("01","01-enable-plugins",(440,40,1160,560))
crop("02","02-actions-menu",(440,40,1160,760))
crop("03","03-add-project",(440,40,1160,430))
crop("04","04-connect-1password",(440,150,1160,860))
crop("05","05-field-picker",(380,88,900,580))
crop("06","06-variables",(440,150,1160,700))
crop("07","07-test-result",(440,320,1160,640))
P
rm -rf "${OUT:?}/raw"   # raw frames show the sidebar with this Mac's host name
