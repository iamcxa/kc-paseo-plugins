import type { PluginServerContext } from "@getpaseo/plugin/server";
import { ensureCoordinator } from "./server/coordinator";
import { FLEET_SERVER_NAME, rememberPaseo, rememberedPaseo, startFleetServer } from "./server/fleet-mcp";
import { readReviewsHandler, startReviewPoller } from "./server/reviews";
import { readReviews } from "./shared/reviews";
import { stopAgentHandler } from "./server/control";
import { stopAgent } from "./shared/control";
import { claimDecisionHandler, readDecisionHandler, releaseDecisionHandler } from "./server/decisions";
import { readGateBriefingHandler } from "./server/gate";
import { claimDecision, readDecision, releaseDecision } from "./shared/decisions";
import { readGatesHandler, readTasksHandler } from "./server/tasks";
import { readGateBriefing } from "./shared/gate";
import { readGates, readTasks } from "./shared/tasks";
import {
  COORDINATOR_PROMPT,
  RESPONDER_TOOL,
  openCoordinator,
} from "./shared/coordinator";

export default function contribute(server: PluginServerContext) {
  const fleet = startFleetServer().catch((error) => {
    console.error("fleet MCP server did not start:", error);
    return null;
  });

  const stopReviews = startReviewPoller(rememberedPaseo);
  server.on("agent.turn_ended", (_event, { paseo }) => rememberPaseo(paseo));
  server.handle(readReviews, (_input, { paseo }) => {
    rememberPaseo(paseo);
    return readReviewsHandler();
  });

  server.handle(openCoordinator, (_input, { paseo }) => {
    rememberPaseo(paseo);
    return ensureCoordinator(paseo);
  });
  server.handle(readTasks, (input, { paseo }) => {
    rememberPaseo(paseo);
    return readTasksHandler(input);
  });
  server.handle(readGateBriefing, readGateBriefingHandler);
  server.handle(claimDecision, claimDecisionHandler);
  server.handle(readDecision, readDecisionHandler);
  server.handle(releaseDecision, releaseDecisionHandler);
  server.handle(stopAgent, stopAgentHandler);
  server.handle(readGates, (input, { paseo }) => {
    rememberPaseo(paseo);
    return readGatesHandler(input);
  });

  server.before("agent.create", async ({ request }, { paseo }) => {
    rememberPaseo(paseo);
    const config = request.config;
    if (config.systemPrompt === COORDINATOR_PROMPT) {
      const started = await fleet;
      if (!started) return undefined;
      return {
        ...request,
        config: {
          ...config,
          mcpServers: {
            ...config.mcpServers,
            [FLEET_SERVER_NAME]: { type: "http", url: started.url },
          },
        },
      };
    }
    // create_agent copies a same-provider caller's providerOptions onto the agent it starts;
    // without this the FOs a coordinator starts would carry its tool restrictions.
    const options = config.providerOptions ?? {};
    if (!JSON.stringify(options.settings ?? null).includes(RESPONDER_TOOL)) return undefined;
    const { allowedTools: _allowed, settings: _settings, ...rest } = options;
    const { [FLEET_SERVER_NAME]: _fleet, ...mcpServers } = config.mcpServers ?? {};
    return { ...request, config: { ...config, providerOptions: rest, mcpServers } };
  });

  return async () => {
    stopReviews();
    const started = await fleet;
    started?.server.close();
  };
}
