# Isolated Paseo 0.14.0 for project-env-resume-blank-notice. Never uses /Applications/Paseo.app or the global paseo.
RUN=${RUN:?run label}
ROOT=/tmp/pe-val
S=$ROOT/run-$RUN
PASEO_PKG=${PASEO_PKG:-$ROOT/install-$RUN}
PASEO="$PASEO_PKG/node_modules/.bin/paseo"
PORT=${PORT:?port}
PLUGIN_ID=pe-resume
CHECKOUT=${CHECKOUT:-/Users/kent/Project/kc-paseo-plugins}
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
