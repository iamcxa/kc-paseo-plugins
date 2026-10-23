# Shared settings. Override CHECKOUT to test another build of project-env.
CHECKOUT=${CHECKOUT:-/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-add-variable-one-step}
S=${S:-/tmp/pe-validate-add}
PORT=${PORT:-6903}
PLUGIN_ID=pe-validate-add
SESSION=pe-validate-add
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ab() { agent-browser --session $SESSION "$@"; }
