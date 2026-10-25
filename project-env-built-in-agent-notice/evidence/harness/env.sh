# Isolated Paseo for project-env-built-in-agent-notice. LABEL (main|cand) names the build.
LABEL=${LABEL:-cand}
ROOT=${ROOT:-/tmp/pe-ban}
CHECKOUT=${CHECKOUT:-$ROOT/src-$LABEL}
S=${S:-$ROOT/s-$LABEL}
PORT=${PORT:-6934}
PLUGIN_ID=pe-ban
SESSION=pe-ban-$LABEL
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ab() { agent-browser --session $SESSION "$@"; }
