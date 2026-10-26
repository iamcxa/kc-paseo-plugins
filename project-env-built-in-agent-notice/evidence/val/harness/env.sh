# Isolated Paseo for project-env-built-in-agent-notice. LABEL (main|cand) names the build.
LABEL=${LABEL:-cand}
ROOT=${ROOT:-/tmp/pe-val/run}
CHECKOUT=${CHECKOUT:-$ROOT/src-$LABEL}
S=${S:-$ROOT/s-$LABEL}
PORT=${PORT:-6961}
PLUGIN_ID=pe-val
SESSION=${SESSION:-pe-val-$LABEL}
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ab() { agent-browser --session $SESSION "$@"; }
