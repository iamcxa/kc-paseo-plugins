# Isolated Paseo for the A5 polish review. Builds project-env from CHECKOUT (default: main checkout).
CHECKOUT=${CHECKOUT:-/tmp/pe-save-ckpt}
S=${S:-/tmp/pe-save}
PORT=${PORT:-6931}
PLUGIN_ID=${PLUGIN_ID:-pe-save}
SESSION=${SESSION:-pe-save}
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ab() { agent-browser --session $SESSION "$@"; }
