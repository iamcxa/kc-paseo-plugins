#!/bin/sh
exec timeout 45 agent-browser --session tsfmval2 "$@"
