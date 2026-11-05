# Isolated Paseo for project-env-picker-slow-hint.
LABEL=${LABEL:-main}
ROOT=${ROOT:-/tmp/pe-psh}
CHECKOUT=${CHECKOUT:-/Users/kent/Project/kc-paseo-plugins}
S=${S:-$ROOT/s-$LABEL}
PORT=${PORT:-7391}
N=${N:-30}
DELAY=${DELAY:-200}
PLUGIN_ID=pe-psh
SESSION=${SESSION:-pe-psh-$LABEL}
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ab() { agent-browser --session $SESSION "$@"; }
