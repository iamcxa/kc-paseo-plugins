# Isolated Paseo for project-env-service-account-trim. Own home and port; fake op and security; no real secret.
LABEL=${LABEL:-main}
ROOT=${ROOT:-/tmp/pe-trim}
CHECKOUT=${CHECKOUT:-/Users/kent/Project/kc-paseo-plugins}
S=${S:-$ROOT/s-$LABEL}
PORT=${PORT:-7493}
PLUGIN_ID=pe-trim
# @getpaseo/cli installed with npm into $ROOT/install (npm install @getpaseo/cli@0.15.3); the mock provider needs PASEO_NODE_ENV=development.
PASEO=${PASEO:-$ROOT/install/node_modules/.bin/paseo}
SESSION=${SESSION:-pe-trim-$LABEL}
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ab() { agent-browser --session $SESSION "$@"; }
rf() { ab snapshot -i | grep "$1" | head -1 | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/'; }
