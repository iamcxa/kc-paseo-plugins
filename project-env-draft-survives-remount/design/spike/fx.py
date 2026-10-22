import json,sys,os
S="/tmp/draft-remount-spike"
os.makedirs(S+"/home/plugin-settings/draft-remount-spike",exist_ok=True)
projects=[{"root":S+"/demo-app","serviceAccount":"sa-a","vault":"demo-dev","prompt":"","variables":[
 {"name":"SENTRY_AUTH_TOKEN","ref":"op://demo-dev/SENTRY/SENTRY_AUTH_TOKEN"},
 {"name":"SENTRY_PROJECT","ref":"op://demo-dev/SENTRY/SENTRY_PROJECT"},
 {"name":"STRIPE_KEY","ref":"op://demo-dev/stripe/secret-key"},
 {"name":"TWILIO_AUTH_TOKEN","ref":"op://demo-dev/TWILIO/TWILIO_ACCOUNT_SID"},
 {"name":"POSTHOG_CLI_HOST","ref":""},
 {"name":"POSTHOG_CLI_API_KEY","ref":"op://demo-dev/POSTHOG/POSTHOG_CLI_API_KEY"}]}]
json.dump({"version":1,"values":{"projects":projects}},open(S+"/home/plugin-settings/draft-remount-spike/projects.json","w"))
