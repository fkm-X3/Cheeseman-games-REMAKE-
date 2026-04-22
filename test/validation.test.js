const test = require("node:test");
const assert = require("node:assert/strict");

const {
  InputError,
  parseJsonBody,
  validateGameKey,
  validateScore,
  parseLimit,
} = require("../netlify/functions/_lib/validation");

test("parseJsonBody parses valid json", () => {
  const body = parseJsonBody({ body: "{\"score\": 10}" });
  assert.equal(body.score, 10);
});

test("parseJsonBody throws InputError for invalid json", () => {
  assert.throws(
    () => parseJsonBody({ body: "{invalid}" }),
    (error) => error instanceof InputError
  );
});

test("validateScore accepts integer score range", () => {
  assert.equal(validateScore(123), 123);
  assert.throws(() => validateScore(-1), InputError);
});

test("validateGameKey defaults to cheese-clicker", () => {
  assert.equal(validateGameKey(undefined), "cheese-clicker");
  assert.equal(validateGameKey("test-game"), "test-game");
});

test("parseLimit uses default and validates bounds", () => {
  assert.equal(parseLimit(undefined), 10);
  assert.equal(parseLimit("25"), 25);
  assert.throws(() => parseLimit("0"), InputError);
  assert.throws(() => parseLimit("51"), InputError);
});
