# Isolated Paseo for project-env-vault-list-loads-faster. LABEL (main|cand) names the build.
LABEL=${LABEL:-main}
ROOT=${ROOT:-/tmp/pe-vlf}
CHECKOUT=${CHECKOUT:-$ROOT/src-$LABEL}
S=${S:-$ROOT/s-$LABEL}
PORT=${PORT:-7188}
N=${N:-30}          # items in the fake vault
DELAY=${DELAY:-200} # fixed delay of every fake `op item list` / `op item get`, ms
PLUGIN_ID=pe-vlf
SESSION=${SESSION:-pe-vlf-$LABEL}
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ab() { agent-browser --session $SESSION "$@"; }
