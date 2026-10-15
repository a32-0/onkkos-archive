const LONG_OPEN = /^\[(=*)\[/;
const NUMBER = /^-?(0x[0-9a-f]+|\d*\.?\d+(e[+-]?\d+)?)/i;
const NAME = /^[A-Za-z_][\w.]*/;
const FIELD = /^([A-Za-z_]\w*)\s*=(?!=)/;
const ESCAPES = { n: "\n", r: "\r", t: "\t" };

export function parseLuaTable(source, from) {
  let at = from;

  const skip = () => {
    for (;;) {
      while (at < source.length && /\s/.test(source[at])) at += 1;
      if (!source.startsWith("--", at)) return;
      const long = LONG_OPEN.exec(source.slice(at + 2, at + 12));
      if (long) {
        const end = source.indexOf(`]${long[1]}]`, at);
        at = end < 0 ? source.length : end + long[1].length + 2;
      } else {
        const line = source.indexOf("\n", at);
        at = line < 0 ? source.length : line + 1;
      }
    }
  };

  const quoted = () => {
    const quote = source[at];
    at += 1;
    let out = "";
    while (source[at] !== quote) {
      if (source[at] === "\\") {
        const next = source[at + 1];
        out += ESCAPES[next] ?? next;
        at += 2;
      } else {
        out += source[at];
        at += 1;
      }
    }
    at += 1;
    return out;
  };

  const long = () => {
    const open = LONG_OPEN.exec(source.slice(at, at + 12));
    const close = `]${open[1]}]`;
    const start = at + open[0].length;
    const end = source.indexOf(close, start);
    at = end + close.length;
    return source.slice(start, end).replace(/^\n/, "");
  };

  const value = () => {
    skip();
    const head = source[at];
    if (head === "{") return table();
    if (head === '"' || head === "'") {
      let text = quoted();
      skip();
      while (source.startsWith("..", at)) {
        at += 2;
        text += String(value());
        skip();
      }
      return text;
    }
    if (head === "[" && LONG_OPEN.test(source.slice(at, at + 12))) return long();
    const number = NUMBER.exec(source.slice(at, at + 40));
    if (number) {
      at += number[0].length;
      return Number(number[0]);
    }
    const name = NAME.exec(source.slice(at, at + 120));
    if (name) {
      at += name[0].length;
      if (name[0] === "true") return true;
      if (name[0] === "false") return false;
      if (name[0] === "nil") return null;
      return { $ref: name[0] };
    }
    throw new Error(`unreadable Lua at ${at}: ${source.slice(at, at + 40)}`);
  };

  const table = () => {
    at += 1;
    const list = [];
    const fields = {};
    let keyed = false;
    for (;;) {
      skip();
      if (source[at] === "}") {
        at += 1;
        break;
      }
      let key = null;
      if (source[at] === "[" && !LONG_OPEN.test(source.slice(at, at + 12))) {
        at += 1;
        key = value();
        skip();
        at += 1;
        skip();
        at += 1;
      } else {
        const field = FIELD.exec(source.slice(at, at + 120));
        if (field) {
          key = field[1];
          at += field[0].length;
        }
      }
      const entry = value();
      if (key === null) list.push(entry);
      else {
        keyed = true;
        fields[key] = entry;
      }
      skip();
      if (source[at] === "," || source[at] === ";") at += 1;
    }
    if (!keyed) return list;
    list.forEach((entry, index) => {
      fields[index + 1] = entry;
    });
    return fields;
  };

  return value();
}

export function parseLuaModule(source) {
  const start = source.search(/(^|\n)\s*(return|local\s+\w+\s*=)\s*\{/);
  if (start < 0) throw new Error("no table in module");
  return parseLuaTable(source, source.indexOf("{", start));
}

export function parseLuaLocal(source, name) {
  const start = source.search(new RegExp(`(^|\\n)local\\s+${name}\\s*=\\s*\\{`));
  if (start < 0) throw new Error(`no local ${name} in module`);
  return parseLuaTable(source, source.indexOf("{", start));
}
