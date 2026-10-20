import type { PluginServerContext } from "@getpaseo/plugin/server";
import { contribute } from "./server/contribute";
import { realTools } from "./server/tools";

export default function plugin(server: PluginServerContext) {
  return contribute(server, realTools);
}
