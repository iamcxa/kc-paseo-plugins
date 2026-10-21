import { existsSync } from "node:fs";
import type { Tools } from "./secrets.ts";

// The daemon is launched by the desktop app, so its PATH may lack Homebrew.
const op = ["/opt/homebrew/bin/op", "/usr/local/bin/op"].find((p) => existsSync(p)) ?? "op";

export const realTools: Tools = { op, security: "/usr/bin/security", git: "/usr/bin/git" };
