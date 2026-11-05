// usage: node timeline.mjs <port> <agent-id> [count]   Prints the type of the last [count] timeline items; a plugin row prints its kind and data. Reads, never appends.
import { pathToFileURL } from "node:url";
const [port, id, count = "60"] = process.argv.slice(2);
const { createPaseoClient } = await import(pathToFileURL(`${process.env.PASEO_PKG}/node_modules/@getpaseo/client/dist/index.js`).href);
const client = createPaseoClient({ url: `ws://127.0.0.1:${port}/ws` });
await client.connect();
const page = await client.agents.ref(id).timeline.refetch({ direction: "tail", limit: Number(count) });
const entries = page.entries ?? page.items ?? [];
for (const e of entries) {
  const item = e.item ?? e;
  const base = `${e.seqStart ?? e.seq ?? ""} ${item.type}`;
  if (item.type === "plugin") console.log(base, item.kind, JSON.stringify(item.data));
  else if (item.type === "user_message") console.log(base, JSON.stringify(String(item.text).slice(0, 40)));
  else console.log(base);
}
console.log("items:", entries.length);
await client.close();
