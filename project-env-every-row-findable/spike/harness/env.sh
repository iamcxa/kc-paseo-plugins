# Isolated Paseo for project-env-every-row-findable. CHECKOUT holds a project-env/ directory.
CHECKOUT=${CHECKOUT:-/tmp/pe-row/ckpt}
S=${S:-/tmp/pe-row/s}
PORT=${PORT:-6941}
PLUGIN_ID=${PLUGIN_ID:-pe-row}
SESSION=${SESSION:-pe-row}
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ab() { agent-browser --session $SESSION "$@"; }
