const defaultHeaders = {
  "Content-Type": "application/json",
};

function json(statusCode, payload) {
  return {
    statusCode,
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  };
}

function ok(payload) {
  return json(200, payload);
}

function created(payload) {
  return json(201, payload);
}

function badRequest(message) {
  return json(400, { error: message });
}

function unauthorized(message = "Unauthorized.") {
  return json(401, { error: message });
}

function conflict(message) {
  return json(409, { error: message });
}

function methodNotAllowed(allowedMethods) {
  return {
    statusCode: 405,
    headers: {
      ...defaultHeaders,
      Allow: allowedMethods.join(", "),
    },
    body: JSON.stringify({ error: "Method not allowed." }),
  };
}

function internalError(error, context) {
  console.error(`[${context}]`, error);
  return json(500, { error: "Internal server error." });
}

module.exports = {
  ok,
  created,
  badRequest,
  unauthorized,
  conflict,
  methodNotAllowed,
  internalError,
};
