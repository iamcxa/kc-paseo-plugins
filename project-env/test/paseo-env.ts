// Paseo builds a launched agent's environment as Object.assign({}, process.env, ..., launchEnv)
// and deletes only `undefined` values (buildExternalProcessEnv), so "" overrides the daemon's value.
export function paseoLaunchEnv(
  daemonEnv: Record<string, string | undefined>,
  hookEnv: Record<string, string>,
): Record<string, string | undefined> {
  return Object.assign({}, daemonEnv, hookEnv);
}
