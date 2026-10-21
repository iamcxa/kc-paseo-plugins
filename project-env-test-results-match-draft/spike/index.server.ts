import type { PluginServerContext } from "@getpaseo/plugin/server";
import { contribute } from "./server/contribute";

const W = "/tmp/pe-t4-match-draft/tmp/project-env-world-oETA7Z";
export default function plugin(server: PluginServerContext) {
  return contribute(server, { op: W + "/op", security: W + "/security", git: "/usr/bin/git" });
}
