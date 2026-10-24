# Isolated Paseo for project-env-connection-done-cancel-one-row. LABEL (main|cand) names the build.
LABEL=${LABEL:-cand}
CHECKOUT=${CHECKOUT:-/Users/kent/Project/kc-paseo-plugins}
ROOT=${ROOT:-/tmp/pe-cdc-impl}
S=${S:-$ROOT/s-$LABEL}
PORT=${PORT:-6964}
PLUGIN_ID=pe-cdc-impl
SESSION=pe-cdc-impl-$LABEL
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ab() { agent-browser --session $SESSION "$@"; }
