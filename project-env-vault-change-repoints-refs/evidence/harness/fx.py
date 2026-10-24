import json,sys
S,ID=sys.argv[1],sys.argv[2]
def v(n,r): return {"name":n,"ref":r}
def dev(vault): return [v("SENTRY_AUTH_TOKEN",f"op://{vault}/SENTRY/SENTRY_AUTH_TOKEN"),v("STRIPE_KEY",f"op://{vault}/stripe/secret-key"),v("POSTHOG_CLI_API_KEY",f"op://{vault}/POSTHOG/POSTHOG_CLI_API_KEY")]
projects=[
 {"root":S+"/work","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":dev("Dev")},
 {"root":S+"/work-renamed","serviceAccount":"sa-r","vault":"Dev","prompt":"","variables":dev("Dev")},
 {"root":S+"/work-mixed","serviceAccount":"sa-r","vault":"Dev","prompt":"","variables":dev("Dev")+[v("TWILIO_AUTH_TOKEN","op://Other/TWILIO/TWILIO_ACCOUNT_SID")]},
 {"root":S+"/work-outside","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":[dev("Dev")[0],v("STRIPE_KEY","op://Other/stripe/secret-key"),dev("Dev")[2],v("LINEAR_API_KEY","")]},
 {"root":S+"/work-long","serviceAccount":"sa-r","vault":"agent-subspace-relay-staging","prompt":"","variables":dev("agent-subspace-relay-staging")},
 {"root":S+"/work-single","serviceAccount":"sa-s","vault":"Dev","prompt":"","variables":dev("Dev")},
 {"root":S+"/work-empty","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":[]},
]
json.dump({"version":1,"values":{"projects":projects}},open(f"{S}/home/plugin-settings/{ID}/projects.json","w"))
