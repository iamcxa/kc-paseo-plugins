# Isolated Paseo for the validation run of project-env-vault-change-repoints-refs (candidate 1450008 from git archive).
LABEL=${LABEL:-val}
ROOT=${ROOT:-/tmp/pe-vcr-val}
CHECKOUT=${CHECKOUT:-$ROOT/src}
S=${S:-$ROOT/s-$LABEL}
PORT=${PORT:-6991}
PLUGIN_ID=pe-vcr-val
SESSION=pe-vcr-val-$LABEL
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ab() { agent-browser --session $SESSION "$@"; }
