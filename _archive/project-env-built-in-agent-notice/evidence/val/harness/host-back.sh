export LABEL=cand PORT=6944 ROOT=/tmp/pe-bn2 SESSION=pe-bn2-cand
cd /Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/project-env-built-in-agent-notice/evidence/harness
. ./env.sh
python3 -I fx.py $S $PLUGIN_ID; SID=$(cat $S/home/server-id)
ab close >/dev/null 2>&1; ab open "http://127.0.0.1:$PORT/" >/dev/null; sleep 4; ab set viewport 1280 1400 >/dev/null
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$PLUGIN_ID/projects"
ab open "$URL" >/dev/null; sleep 3
gr() { ab snapshot -i | grep -m1 "$1" | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/'; }
ab click $(ab snapshot -i | grep 'button "Edit"' | sed -n 1p | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/') >/dev/null; sleep 2
ab click $(gr 'button "Remove SENTRY_AUTH_TOKEN"') >/dev/null; sleep 1; echo "bar: $(ab get text body | grep -m1 'unsaved')"
ab click $(gr 'button "Back to plugins"') >/dev/null; sleep 3; echo "url after host back: $(ab get url)"
ab click $(gr 'button "Back to plugins"') >/dev/null 2>&1
ab open "$URL" >/dev/null; sleep 3; echo "reopen by URL: editor rows $(ab get text body | grep -c 'Stop managing'); list rows $(ab get text body | grep -c 'variables ·')"
echo ---- in-app return
ab open "$URL" >/dev/null; sleep 3
ab click $(ab snapshot -i | grep 'button "Edit"' | sed -n 1p | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/') >/dev/null; sleep 2
ab click $(gr 'button "Remove SENTRY_AUTH_TOKEN"') >/dev/null; sleep 1
ab click $(gr 'button "Back to plugins"') >/dev/null; sleep 3
ab snapshot -i | grep -iE 'button|menu' | sed -n 20,60p
ab click @e32 >/dev/null; sleep 1; ab snapshot -i | grep -iE 'menuitem'
ab click $(gr 'menuitem "Project environment"') >/dev/null; sleep 3
echo "in-app return: editor open $(ab get text body | grep -c 'Stop managing'); unsaved bar: $(ab get text body | grep -m1 'unsaved\|No unsaved')"
