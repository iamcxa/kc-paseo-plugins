import json, os, sys
S = "/tmp/draft-remount-impl"
plugin = sys.argv[1]
d = f"{S}/home/plugin-settings/{plugin}"
os.makedirs(d, exist_ok=True)
projects = [{"root": S + "/demo-app", "serviceAccount": "sa-a", "vault": "demo-dev", "prompt": "", "variables": [
    {"name": "SENTRY_AUTH_TOKEN", "ref": "op://demo-dev/SENTRY/SENTRY_AUTH_TOKEN"},
    {"name": "SENTRY_PROJECT", "ref": "op://demo-dev/SENTRY/SENTRY_PROJECT"},
    {"name": "STRIPE_KEY", "ref": "op://demo-dev/stripe/secret-key"}]}]
json.dump({"version": 1, "values": {"projects": projects}}, open(f"{d}/projects.json", "w"))
