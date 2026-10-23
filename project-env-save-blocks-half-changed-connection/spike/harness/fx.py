import json,sys
S,ID=sys.argv[1],sys.argv[2]
def v(n,r): return {"name":n,"ref":r}
projects=[
 {"root":S+"/work","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":[v("SENTRY_AUTH_TOKEN","op://Dev/SENTRY/SENTRY_AUTH_TOKEN"),v("STRIPE_KEY","op://Dev/stripe/secret-key"),v("TWILIO_AUTH_TOKEN","op://Dev/TWILIO/TWILIO_ACCOUNT_SID")]},
 {"root":S+"/work-empty","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":[]},
 {"root":S+"/work-many","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":[v(n,r) for n,r in [("SENTRY_AUTH_TOKEN","op://Dev/SENTRY/SENTRY_AUTH_TOKEN"),("SENTRY_PROJECT","op://Dev/SENTRY/SENTRY_PROJECT"),("STRIPE_KEY","op://Dev/stripe/secret-key"),("STRIPE_WEBHOOK_SECRET","op://Dev/stripe/STRIPE_WEBHOOK_SECRET"),("POSTHOG_CLI_API_KEY","op://Dev/POSTHOG/POSTHOG_CLI_API_KEY"),("POSTHOG_CLI_HOST","op://Dev/POSTHOG/POSTHOG_CLI_HOST"),("TWILIO_ACCOUNT_SID","op://Dev/TWILIO/TWILIO_ACCOUNT_SID"),("DATABASE_URL_FOR_THE_PRODUCTION_REPLICA_READ_ONLY_USER","op://Dev/TWILIO/apiKey"),("LINEAR_API_KEY",""),("RESEND_API_KEY",""),("SLACK_BOT_TOKEN",""),("SLACK_SIGNING_SECRET","")]]},
 {"root":S+"/work-bare","serviceAccount":"","vault":"","prompt":"","variables":[v("OLD_VAR","")]},
]
json.dump({"version":1,"values":{"projects":projects}},open(f"{S}/home/plugin-settings/{ID}/projects.json","w"))
