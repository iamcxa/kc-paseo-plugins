import { makeWorld } from "/tmp/pe-tsfm/plugin/test/world.ts";
const f = (label: string) => ({ label, type: "CONCEALED", value: "FAKE-SENTINEL" });
const item = (id: string, title: string, labels: string[]) => ({ id, title, category: "SECURE_NOTE", fields: labels.map(f) });
const w = makeWorld({
  keychain: { "sa-a": "a" },
  op: { accounts: { a: {
    vaults: ["V"],
    refs: {
      "op://V/SENTRY/SENTRY_AUTH_TOKEN": "fake-1",
      "op://V/SENTRY/SENTRY_PROJECT": "",
      "op://V/TWILIO/TWILIO_ACCOUNT_SID": "fake-2",
      "op://V/POSTHOG/POSTHOG_CLI_API_KEY": "fake-3",
      "op://V/POSTHOG/POSTHOG_CLI_HOST": "fake-4",
    },
    items: [
      item("i1", "SENTRY", ["SENTRY_AUTH_TOKEN", "SENTRY_PROJECT"]),
      item("i2", "TWILIO", ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"]),
      item("i3", "POSTHOG", ["POSTHOG_CLI_API_KEY", "POSTHOG_CLI_HOST"]),
      item("i4", "stripe", ["secret-key"]),
    ],
  } } },
});
console.log(w.dir);
