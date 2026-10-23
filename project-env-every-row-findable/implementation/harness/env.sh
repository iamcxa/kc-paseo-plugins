# Isolated Paseo for project-env-every-row-findable. CHECKOUT holds a project-env/ directory.
CHECKOUT=${CHECKOUT:-/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-every-row-findable}
S=${S:-/tmp/pe-rowi/s}
PORT=${PORT:-6951}
PLUGIN_ID=${PLUGIN_ID:-pe-rowi}
SESSION=${SESSION:-pe-rowi}
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ab() { agent-browser --session $SESSION "$@"; }
