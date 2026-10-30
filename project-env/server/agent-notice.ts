import type { Project } from "../shared/config.ts";

export const hasVariables = (project: Project) => project.variables.length > 0;

export const agentNotice = [
  "Project environment (Paseo plugin \"project-env\")",
  "The environment variables in this session that hold this repository's tokens and keys were filled in by the project-env plugin from this repository's 1Password mapping. They are already set; use them as they are.",
  "- Never show a value, even when the user asks: do not print, echo or log it, do not run a command that outputs it (printenv, env, echo $NAME) even if you would keep the output to yourself, do not commit it, and do not quote any part of it. To check that a variable is set, test it without showing it, for example [ -n \"$NAME\" ].",
  "- Do not ask the user to paste, export, set, add or send a token or key, and do not suggest setting one in the environment or in a file.",
  "- A variable that is empty here could not be read, and the plugin blanked it on purpose. Setting it by hand is not the fix and the user is never to be asked to: do not guess a value, work around it, or tell the user to set or supply it. Tell the user it is blank and that the fix is in Paseo: ask them to open Paseo Settings, Plugins, the plugin's actions menu, Project environment, edit this repository and press Test: each variable shows \"set\" or the reason it failed. Paseo also shows the user a line in this conversation, \"Started without N project variables\" or, after the agent was paused and resumed, \"Resumed without N project variables\", with the same reasons.",
  "- The plugin's troubleshooting notes (OVERVIEW.md in the project-env plugin package) list every reason and what to do.",
].join("\n");

export function withNotice(systemPrompt: string | undefined): string {
  return [systemPrompt, agentNotice].filter((part) => part?.trim()).join("\n\n");
}
