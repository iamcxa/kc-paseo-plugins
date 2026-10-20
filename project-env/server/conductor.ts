import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// Reads only variable names and the `general` prompt from Conductor's repo settings;
// Conductor keeps the values in its own Keychain entries, which this plugin never reads.
export async function importConductor(root: string) {
  const dir = join(root, ".conductor");
  let files: string[] = [];
  try {
    files = (await readdir(dir)).filter((f) => /^settings.*\.toml$/.test(f));
  } catch {
    return { names: [], prompt: "" };
  }
  const names = new Set<string>();
  let prompt = "";
  for (const file of files) {
    const text = await readFile(join(dir, file), "utf8");
    let section = "";
    for (const line of text.split("\n")) {
      const header = line.match(/^\s*\[([^\]]+)\]\s*$/);
      if (header) {
        section = header[1].trim();
        continue;
      }
      if (section === "environment_variables") {
        const key = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
        if (key) names.add(key[1]);
      }
      if (section === "prompts" && !prompt) {
        const general = line.match(/^\s*general\s*=\s*(".*")\s*$/);
        if (general) prompt = JSON.parse(general[1]) as string;
      }
    }
  }
  return { names: [...names].sort(), prompt };
}
