# usage: fixture.py <S> <scenario>   writes names and references only, no value
import json, sys
S, scenario = sys.argv[1], sys.argv[2]
V = "demo-dev"
base = [("SENTRY_AUTH_TOKEN", "SENTRY/SENTRY_AUTH_TOKEN"), ("SENTRY_PROJECT", "SENTRY/SENTRY_PROJECT"),
        ("STRIPE_KEY", "stripe/secret-key"), ("TWILIO_AUTH_TOKEN", "TWILIO/TWILIO_ACCOUNT_SID"),
        ("POSTHOG_CLI_HOST", ""), ("POSTHOG_CLI_API_KEY", "POSTHOG/POSTHOG_CLI_API_KEY")]
if scenario == "long":
    base += [("OPERATOR_SERVICE_ACCOUNT_PASSWORD_ROTATED_FOR_STAGING", "staging-operator-console-credentials/operator_service_account_password_rotated"),
             ("LEGACY_SECTION_REF", "TWILIO/Legacy section/TWILIO_FROM_NUMBER"),
             ("FROM_OTHER_VAULT", "")]
vars_ = [{"name": n, "ref": ("op://%s/%s" % (V, r)) if r else ""} for n, r in base]
if scenario == "long":
    vars_[-1]["ref"] = "op://prod-shared/SENTRY/SENTRY_ORG"
    vars_.append({"name": "TYPED_BY_HAND", "ref": "op://demo-dev"})
proj = {"root": S + "/work/demo-app", "serviceAccount": "demo-read", "vault": V, "prompt": "", "variables": vars_}
if scenario == "failed":
    vars_[2]["ref"] = "op://%s/stripe/old-key" % V
    vars_[4]["ref"] = "op://%s/POSTHOG/POSTHOG_CLI_HOST" % V
if scenario == "nokey":
    proj["serviceAccount"] = "not-stored"
json.dump({"version": 1, "values": {"projects": [proj]}},
          open(S + "/home/plugin-settings/field-pill-spike/projects.json", "w"))
