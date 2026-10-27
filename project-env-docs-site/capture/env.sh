CHECKOUT=${CHECKOUT:-/Users/kent/Project/kc-paseo-plugins}
S=${S:-/tmp/projects}
PORT=${PORT:-7520}
PLUGIN_ID=paseo-project-env
SESSION=pe-docs-fake
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ab() { agent-browser --session $SESSION "$@"; }
