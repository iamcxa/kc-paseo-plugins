# Isolated Paseo 0.14.0 for project-env-rate-limit-cause. Never uses /Applications/Paseo.app or the global paseo.
RUN=${RUN:?run label}
ROOT=/tmp/pe-rl2
S=$ROOT/run-$RUN
PASEO_PKG=$ROOT/install-$RUN
PASEO="$PASEO_PKG/node_modules/.bin/paseo"
PORT=${PORT:?port}
PLUGIN_ID=pe-rl
CHECKOUT=${CHECKOUT:?checkout holding project-env}
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
