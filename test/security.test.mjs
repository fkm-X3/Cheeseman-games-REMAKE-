import test from "node:test";
import assert from "node:assert/strict";

import {
  OriginNotAllowedError,
  assertWriteOriginAllowed,
  getAllowedWriteOrigins,
} from "../lib/server/security.mjs";

function buildRequest(origin) {
  return {
    headers: {
      get(name) {
        if (name !== "origin") {
          return null;
        }
        return origin ?? null;
      },
    },
  };
}

test("getAllowedWriteOrigins includes localhost defaults outside production", () => {
  const origins = getAllowedWriteOrigins({ nodeEnv: "development" });
  assert.deepEqual(origins, [
    "https://cheeseman-games-remake.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]);
});

test("getAllowedWriteOrigins uses configured origins when provided", () => {
  const origins = getAllowedWriteOrigins({
    nodeEnv: "production",
    configuredOrigins: " https://cheeseman-games-remake.vercel.app,https://example.com ",
  });
  assert.deepEqual(origins, [
    "https://cheeseman-games-remake.vercel.app",
    "https://example.com",
  ]);
});

test("assertWriteOriginAllowed accepts allowed origin", () => {
  const origin = assertWriteOriginAllowed(buildRequest("https://cheeseman-games-remake.vercel.app"), {
    nodeEnv: "production",
  });
  assert.equal(origin, "https://cheeseman-games-remake.vercel.app");
});

test("assertWriteOriginAllowed rejects missing origin", () => {
  assert.throws(
    () =>
      assertWriteOriginAllowed(buildRequest(null), {
        nodeEnv: "production",
      }),
    (error) => error instanceof OriginNotAllowedError
  );
});

test("assertWriteOriginAllowed rejects disallowed origin", () => {
  assert.throws(
    () =>
      assertWriteOriginAllowed(buildRequest("https://evil.example"), {
        nodeEnv: "production",
      }),
    (error) => error instanceof OriginNotAllowedError
  );
});
