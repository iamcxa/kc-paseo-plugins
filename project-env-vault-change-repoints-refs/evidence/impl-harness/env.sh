# Isolated Paseo for the implementation run of project-env-vault-change-repoints-refs.
LABEL=${LABEL:-impl}
ROOT=${ROOT:-/tmp/pe-vcr-impl}
CHECKOUT=${CHECKOUT:-/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-vault-change-repoints-refs}
S=${S:-$ROOT/s-$LABEL}
PORT=${PORT:-6981}
PLUGIN_ID=pe-vcr
SESSION=pe-vcr-impl-$LABEL
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ab() { agent-browser --session $SESSION "$@"; }
