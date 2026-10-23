import { pathToFileURL } from "node:url";

import { guardEveryServer } from "./guard.js";

const token = process.env.WF_LAUNCH_TOKEN;
const host = process.env.WF_LAUNCH_HOST;
const server = process.argv[2];
if (!token || !host || !server)
  throw new Error("The server needs its secret, its host and its file");

guardEveryServer(token, host);
await import(pathToFileURL(server).href);
