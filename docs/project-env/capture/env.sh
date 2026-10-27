: "${S:?work directory}" "${PORT:?port}"
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
CHECKOUT=$(cd "$HERE/../../.." && pwd)
PLUGIN_ID=paseo-project-env
SESSION=pe-docs-fake
ab() { agent-browser --session $SESSION "$@"; }
