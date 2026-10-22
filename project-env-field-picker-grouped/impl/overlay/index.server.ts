import type { PluginServerContext } from "@getpaseo/plugin/server";
import { contribute } from "./server/contribute";
import { makeWorld, type FakeItem } from "./server/spike-world";

// Disposable spike: fake op/security/git, so no Keychain or 1Password is touched.
const note = (id: string, title: string, labels: string[]): FakeItem => ({
  id,
  title,
  category: "SECURE_NOTE",
  fields: [
    { label: "notesPlain", type: "STRING", purpose: "NOTES", value: "" },
    ...labels.map((label) => ({ label, type: "CONCEALED", value: "x" })),
  ],
});
const items: FakeItem[] = [
  note("i-clerk", "Clerk (development)", ["CLERK_SECRET_KEY", "CLERK_PUBLISHABLE_KEY"]),
  note("i-github", "GitHub", ["GITHUB_TOKEN"]),
  note("i-linear", "Linear", ["LINEAR_API_KEY"]),
  note("i-openai", "OpenAI", ["OPENAI_API_KEY"]),
  note("i-posthog", "PostHog", ["POSTHOG_CLI_API_KEY", "POSTHOG_CLI_HOST", "POSTHOG_PROJECT_ID"]),
  note("i-resend", "Resend", ["RESEND_API_KEY"]),
  note("i-sentry", "Sentry", ["SENTRY_AUTH_TOKEN", "SENTRY_ORG", "SENTRY_PROJECT"]),
  note("i-sentry-staging", "Sentry (staging)", ["SENTRY_AUTH_TOKEN", "SENTRY_PROJECT"]),
  note("i-stripe", "Stripe", ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]),
  note("i-supabase", "Supabase", ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]),
  note("i-twilio", "Twilio", ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"]),
  note("i-vercel", "Vercel", ["VERCEL_TOKEN"]),
  note("i-notion", "Notion", ["NOTION_TOKEN"]),
  note("i-slack", "Slack", ["SLACK_BOT_TOKEN", "SLACK_SIGNING_SECRET"]),
  note("i-datadog", "Datadog", ["DD_API_KEY", "DD_APP_KEY"]),
  note("i-cloudflare", "Cloudflare", ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"]),
  note("i-fly", "Fly.io", ["FLY_API_TOKEN"]),
  note("i-mailgun", "Mailgun", ["MAILGUN_API_KEY", "MAILGUN_DOMAIN"]),
  note("i-algolia", "Algolia", ["ALGOLIA_APP_ID", "ALGOLIA_ADMIN_KEY"]),
  note("i-long", "Internal billing platform production credentials (EU region)", [
    "STRIPE_CONNECT_PLATFORM_WEBHOOK_SIGNING_SECRET_EU_PRODUCTION",
  ]),
  { id: "i-deploy", title: "Deploy key", category: "SSH_KEY", fields: [] },
  { id: "i-passport", title: "Notary scan", category: "DOCUMENT", fields: [] },
];
const refs: Record<string, string> = {};
for (const item of items)
  for (const f of item.fields ?? []) if (f.label !== "notesPlain") refs[`op://Dev/${item.title}/${f.label}`] = "x";

const world = makeWorld({
  keychain: { "sa-a": "a" },
  op: {
    accounts: { a: { vaults: ["Dev", "Empty"], refs, items } },
    fail: {
      "item get i-deploy": { stderr: "[ERROR] invalid PEM private key passed in" },
      "item get i-passport": { stderr: "[ERROR] document items have no fields" },
    },
  },
  git: { answers: {} },
});

export default function plugin(server: PluginServerContext) {
  return contribute(server, world.tools);
}
