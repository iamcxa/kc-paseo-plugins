import json,sys
S,ID=sys.argv[1],sys.argv[2]
def v(n,r): return {"name":n,"ref":r}
dev=[v("SENTRY_AUTH_TOKEN","op://Dev/SENTRY/SENTRY_AUTH_TOKEN"),v("STRIPE_KEY","op://Dev/stripe/secret-key"),v("POSTHOG_CLI_API_KEY","op://Dev/POSTHOG/POSTHOG_CLI_API_KEY")]
projects=[
 {"root":S+"/work","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":dev},
 {"root":S+"/work-legacy","serviceAccount":"sa-a","vault":"Dev","prompt":"LEGACY-PROMPT-TEXT: always answer in French.","variables":dev},
 {"root":S+"/work-empty","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":[]},
 {"root":S+"/work-mixed","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":[dev[0],v("STRIPE_KEY","op://Other/stripe/secret-key"),v("LINEAR_API_KEY",""),v("MISSING_ONE","op://Dev/SENTRY/SENTRY_PROJECT")]},
 {"root":S+"/work-bare","serviceAccount":"","vault":"","prompt":"","variables":[]},
 {"root":S+"/clients/acme/monorepo/a-very-long-project-folder-name-for-a-checkout-of-the-main-branch","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":dev[:1]},
]
json.dump({"version":1,"values":{"projects":projects}},open(f"{S}/home/plugin-settings/{ID}/projects.json","w"))
