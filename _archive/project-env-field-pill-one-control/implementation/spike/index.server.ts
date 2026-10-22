import type { PluginServerContext } from "@getpaseo/plugin/server";
import { contribute } from "./server/contribute";
import { makeWorld } from "./server/spike-world";

// Disposable: fake op/security/git, so no Keychain or 1Password is touched. Names only, no real value.
const fields = (labels: string[]) => labels.map((label) => ({ label, type: "CONCEALED", value: "x" }));
const mode = process.env.FIELD_PILL_MODE ?? "base";
const world = makeWorld({
  keychain: { "demo-read": "a" },
  op: {
    ...(mode === "slowtoken" ? { vaultListDelayMs: 4000 } : {}),
    ...(mode === "slow" ? { itemListDelayMs: 1500 } : {}),
    ...(mode === "fail" ? { fail: { "item list": { stderr: "[ERROR] network unreachable" } } } : {}),
    accounts: {
      a: {
        vaults: ["demo-dev"],
        refs: {
          "op://demo-dev/SENTRY/SENTRY_AUTH_TOKEN": "x",
          "op://demo-dev/SENTRY/SENTRY_PROJECT": "x",
          "op://demo-dev/stripe/secret-key": "x",
          "op://demo-dev/TWILIO/TWILIO_ACCOUNT_SID": "x",
          "op://demo-dev/POSTHOG/POSTHOG_CLI_API_KEY": "x",
          "op://demo-dev/POSTHOG/POSTHOG_CLI_HOST": "x",
        },
        items: [
          { id: "i1", title: "SENTRY", category: "SECURE_NOTE", fields: fields(["SENTRY_AUTH_TOKEN", "SENTRY_ORG", "SENTRY_PROJECT"]) },
          { id: "i2", title: "stripe", category: "SECURE_NOTE", fields: fields(["secret-key", "publishable-key"]) },
          { id: "i3", title: "TWILIO", category: "SECURE_NOTE", fields: fields(["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"]) },
          { id: "i4", title: "POSTHOG", category: "SECURE_NOTE", fields: fields(["POSTHOG_CLI_API_KEY", "POSTHOG_CLI_HOST", "POSTHOG_CLI_PROJECT_ID"]) },
          { id: "i5", title: "staging-operator-console-credentials", category: "SECURE_NOTE", fields: fields(["operator_service_account_password_rotated"]) },
          { id: "i6", title: "deploy-key", category: "SSH_KEY", fields: [] },
        ],
      },
    },
  },
  git: { answers: {} },
});

export default function plugin(server: PluginServerContext) {
  return contribute(server, world.tools);
}
