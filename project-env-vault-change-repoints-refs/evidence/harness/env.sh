# Isolated Paseo for project-env-vault-change-repoints-refs. LABEL (main|cand) names the build.
LABEL=${LABEL:-cand}
ROOT=${ROOT:-/tmp/pe-vcr}
CHECKOUT=${CHECKOUT:-$ROOT/src-$LABEL}
S=${S:-$ROOT/s-$LABEL}
PORT=${PORT:-6972}
PLUGIN_ID=pe-vcr
SESSION=pe-vcr-$LABEL
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ab() { agent-browser --session $SESSION "$@"; }
