import { cpSync, existsSync, readdirSync, realpathSync } from "node:fs";
import path from "node:path";

const standalone = path.resolve(import.meta.dirname, "..", "..", ".next", "standalone");
const store = path.join(standalone, "node_modules", ".pnpm");

function packagesIn(folder) {
  return readdirSync(folder).flatMap((name) =>
    name.startsWith("@")
      ? readdirSync(path.join(folder, name)).map((inner) => `${name}/${inner}`)
      : [name],
  );
}

function hoisted() {
  const found = new Map();
  for (const entry of readdirSync(store)) {
    const modules = path.join(store, entry, "node_modules");
    if (!existsSync(modules)) continue;
    for (const name of packagesIn(modules)) {
      const real = realpathSync(path.join(modules, name));
      const seen = found.get(name);
      if (seen && seen !== real) throw new Error(`Two versions of ${name} in the server`);
      found.set(name, real);
    }
  }
  return found;
}

export default function afterPack(context) {
  const server = path.join(context.appOutDir, "resources", "server");
  cpSync(standalone, server, {
    recursive: true,
    dereference: true,
    filter: (source) => source !== path.join(standalone, "node_modules"),
  });
  for (const [name, real] of hoisted()) {
    cpSync(real, path.join(server, "node_modules", name), { recursive: true, dereference: true });
  }
}
