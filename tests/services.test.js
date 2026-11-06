import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { advanceSessionGeneration, apiRequest, fetchAllPages } from "../src/services/api.js";
import { toOpportunity } from "../src/services/opportunities.js";

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
afterEach(() => {
  globalThis.fetch = originalFetch;
  globalThis.window = originalWindow;
});

test("API sends credentials and JSON, and surfaces validation details", async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "http://localhost:3001/api/auth/register");
    assert.equal(options.credentials, "include");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(options.body), { email: "student@ncsu.edu" });
    return Response.json({ error: { message: "Invalid request.", details: [{ field: "email", message: "Invalid email" }] } }, { status: 400 });
  };
  await assert.rejects(apiRequest("/api/auth/register", { method: "POST", body: { email: "student@ncsu.edu" } }), (error) => error.status === 400 && error.message === "email: Invalid email");
});

test("protected 401 expires session; 403 and network failures remain visible", async () => {
  globalThis.window = new EventTarget();
  let expired = 0;
  window.addEventListener("auth:expired", () => { expired += 1; });
  globalThis.fetch = async () => Response.json({ error: { message: "Authentication required." } }, { status: 401 });
  await assert.rejects(apiRequest("/api/auth/me"), { status: 401 });
  assert.equal(expired, 0);
  await assert.rejects(apiRequest("/api/professor/opportunities", { sessionRequired: true }), { status: 401 });
  assert.equal(expired, 1);
  globalThis.fetch = async () => Response.json({ error: { message: "Professor verification required." } }, { status: 403 });
  await assert.rejects(apiRequest("/api/professor/opportunities", { sessionRequired: true }), { status: 403, message: "Professor verification required." });
  globalThis.fetch = async () => { throw new TypeError("fetch failed"); };
  await assert.rejects(apiRequest("/api/opportunities"), { status: 0, message: "Could not connect to the server. Please try again." });
});

test("fetches every API page", async () => {
  const calls = [];
  globalThis.fetch = async (url) => {
    const page = Number(new URL(url).searchParams.get("page"));
    calls.push(page);
    return Response.json({ data: [page], pagination: { totalPages: 3 } });
  };
  assert.deepEqual(await fetchAllPages("/api/opportunities"), [1, 2, 3]);
  assert.deepEqual(calls, [1, 2, 3]);
});

test("stale unauthorized responses do not invalidate a newer session", async () => {
  globalThis.window = new EventTarget();
  let expired = 0;
  window.addEventListener("auth:expired", () => { expired += 1; });
  let respond;
  globalThis.fetch = () => new Promise((resolve) => { respond = resolve; });
  const pending = apiRequest("/api/professor/opportunities", { sessionRequired: true });
  advanceSessionGeneration();
  respond(Response.json({ error: { message: "Authentication required." } }, { status: 401 }));
  await assert.rejects(pending, { status: 401 });
  assert.equal(expired, 0);
});

test("maps database opportunity fields and preserves optional edit values", () => {
  const item = {
    title: "Test", department: "Engineering", professor: { fullName: "Jane Doe" },
    deadline: "2099-12-31T00:00:00.000Z", createdAt: "2026-01-01T00:00:00.000Z",
    opportunityType: "Course Credit", requiredSkills: ["Python"], status: "OPEN",
    contactEmail: "jane@ncsu.edu", applicationUrl: null, location: null, commitment: null, applicationInstructions: null,
  };
  const result = toOpportunity(item);
  assert.equal(result.deadline, "2099-12-31");
  assert.equal(result.type, "Course Credit");
  assert.deepEqual(result.skills, ["Python"]);
  assert.equal(result.professor, "Jane Doe");
  assert.equal(result.status, "open");
  assert.equal(result.sourceLocation, null);
  assert.match(result.applicationHref, /^mailto:jane%40ncsu\.edu/);
});
