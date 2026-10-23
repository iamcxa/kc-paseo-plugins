# Isolated Paseo for the A5 polish review. Builds project-env from CHECKOUT (default: main checkout).
CHECKOUT=${CHECKOUT:-/Users/kent/Project/kc-paseo-plugins}
S=${S:-/tmp/pe-astra}
PORT=${PORT:-6920}
PLUGIN_ID=pe-astra
SESSION=pe-astra
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ab() { agent-browser --session $SESSION "$@"; }
