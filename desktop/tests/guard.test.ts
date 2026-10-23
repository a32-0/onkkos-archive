import assert from "node:assert/strict";
import http from "node:http";
import { after, before, describe, it } from "node:test";

import { guarded, LAUNCH_HEADER } from "../src/guard.ts";

const TOKEN = "a".repeat(64);

describe("the guard in front of Next (spec 13)", () => {
  let server: http.Server;
  let host = "";

  before(async () => {
    server = http.createServer();
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    assert.ok(address && typeof address === "object");
    host = `127.0.0.1:${address.port}`;
    server.on(
      "request",
      guarded((_request, response) => response.end("next"), TOKEN, host),
    );
  });

  after(() => server.close());

  const ask = (headers: Record<string, string>) =>
    new Promise<number | undefined>((resolve, reject) => {
      const [hostname, port] = host.split(":");
      http
        .get({ hostname, port, path: "/system", headers: { host, ...headers } }, (response) => {
          response.resume();
          resolve(response.statusCode);
        })
        .on("error", reject);
    });

  it("lets the window through with the secret on the app's own address", async () => {
    assert.equal(await ask({ [LAUNCH_HEADER]: TOKEN }), 200);
  });

  it("answers 403 without the secret, with another, or on another host", async () => {
    assert.equal(await ask({}), 403);
    assert.equal(await ask({ [LAUNCH_HEADER]: "b".repeat(64) }), 403);
    assert.equal(await ask({ [LAUNCH_HEADER]: "short" }), 403);
    assert.equal(await ask({ [LAUNCH_HEADER]: TOKEN, host: "evil.example" }), 403);
  });
});
