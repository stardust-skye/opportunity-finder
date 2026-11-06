import "dotenv/config";

export function loadConfig(env = process.env) {
  const production = env.NODE_ENV === "production";
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }
  if (!env.FRONTEND_ORIGIN) throw new Error("FRONTEND_ORIGIN is required.");
  let origin;
  try {
    const url = new URL(env.FRONTEND_ORIGIN);
    if (!["http:", "https:"].includes(url.protocol) || url.origin !== env.FRONTEND_ORIGIN) throw new Error();
    if (production && url.protocol !== "https:") throw new Error();
    origin = url.origin;
  } catch {
    throw new Error("FRONTEND_ORIGIN must be an exact HTTP(S) origin (HTTPS in production).");
  }
  const port = Number(env.PORT || 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be between 1 and 65535.");
  if (!["0", "1", undefined].includes(env.TRUST_PROXY)) throw new Error("TRUST_PROXY must be 0 or 1.");
  return { production, origin, port, sessionSecret: env.SESSION_SECRET, trustProxy: env.TRUST_PROXY === "1" };
}
