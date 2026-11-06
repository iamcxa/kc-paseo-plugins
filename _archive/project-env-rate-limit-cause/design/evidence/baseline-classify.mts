import { classifyOpFailure } from "/Users/kent/Project/kc-paseo-plugins/project-env/server/cause.ts";
const lines = [
 "[ERROR] 2026/10/27 14:01:40 Too Many Requests: You've reached the maximum number of this type of requests this service account is allowed to make. Please retry in 40 minutes.",
 "Too Many Requests: You've reached the maximum number of this type of requests",
];
for (const l of lines) console.log(classifyOpFailure({ code: 1, stderr: l + "\n" }), "<-", l.slice(0, 60));
