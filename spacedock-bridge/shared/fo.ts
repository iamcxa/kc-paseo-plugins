import type { PaseoApi } from "@getpaseo/client";
import { ROLE_FO, ROLE_LABEL } from "./board";

export const DEFAULT_FO_PROVIDER = "claude/claude-opus-5-5";

export const FO_STATUS_RULE =
  "At the end of every turn, set your own labels with update_agent on your own agent id: " +
  "`next-owner` is `captain` when your next step needs the Captain and `fo` otherwise; " +
  "`next` is that next step in one short line; `task` is the slug of the task you work on; " +
  "`workflow-dir` is the absolute path you pass to spacedock as --workflow-dir.";

export const DEFAULT_FO_PROMPT =
  "You are the first officer (FO) for this repository. Follow its workflow's FO instructions. " +
  FO_STATUS_RULE;

export interface NewFoInput {
  workspaceId: string;
  repo: string;
  provider?: string;
  prompt?: string;
}

export async function createFo(
  paseo: PaseoApi,
  input: NewFoInput,
): Promise<string> {
  const agent = await paseo.workspaces.ref(input.workspaceId).agents.create({
    config: { provider: input.provider ?? DEFAULT_FO_PROVIDER },
    prompt: input.prompt ?? DEFAULT_FO_PROMPT,
    labels: { [ROLE_LABEL]: ROLE_FO, repo: input.repo },
  });
  return agent.id;
}
