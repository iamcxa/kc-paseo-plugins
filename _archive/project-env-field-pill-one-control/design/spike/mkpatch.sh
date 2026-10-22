#!/bin/sh
# Regenerates prototype.patch from the edited $S/plugin against the pristine copy at $S/src-tmp.
S=${S:-/tmp/field-pill-spike}
D=$(mktemp -d)
mkdir -p "$D/a/server" "$D/b/server"
cp -R "$S/src-tmp/project-env/client" "$S/src-tmp/project-env/shared" "$D/a/"
cp "$S/src-tmp/project-env/server/cause.ts" "$D/a/server/"
cp -R "$S/plugin/client" "$S/plugin/shared" "$D/b/"
cp "$S/plugin/server/cause.ts" "$D/b/server/"
(cd "$D" && diff -ruN a b) > "$(dirname "$0")/prototype.patch"
