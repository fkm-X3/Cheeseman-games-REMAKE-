const { Pool } = require("pg");
const { requireEnv } = require("./env");

let pool;

function buildPool() {
  const connectionString = requireEnv("SUPABASE_DB_URL");
  const isLocalConnection =
    connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

  return new Pool({
    connectionString,
    ssl: isLocalConnection ? false : { rejectUnauthorized: false },
  });
}

function getPool() {
  if (!pool) {
    pool = buildPool();
  }
  return pool;
}

async function query(text, values = []) {
  return getPool().query(text, values);
}

module.exports = {
  query,
  getPool,
};
