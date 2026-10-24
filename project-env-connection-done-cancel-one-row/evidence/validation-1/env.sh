# Isolated Paseo for the acceptance run; every path lives under $ROOT and is removed by accept.sh.
ROOT=${ROOT:?}
CHECKOUT=$ROOT/src
LABEL=${LABEL:-cand}
S=$ROOT/s-$LABEL
PORT=${PORT:-6974}
PLUGIN_ID=pe-cdc-accept
SESSION=pe-cdc-accept-$LABEL
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ab() { agent-browser --session "$SESSION" "$@"; }
