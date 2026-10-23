import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

export const stopAgent = defineRpc({
  name: "agents.stop",
  input: z.object({ agentId: z.string().regex(/^[0-9a-f-]{8,36}$/) }),
  output: z.object({ stopped: z.boolean(), error: z.string().nullable() }),
});
