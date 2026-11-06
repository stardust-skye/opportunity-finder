import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { createApp } from "../src/app.js";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl || !new URL(databaseUrl).pathname.endsWith("_test")) {
  throw new Error("TEST_DATABASE_URL must point to a dedicated database whose name ends in _test.");
}
const db = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
const pool = new pg.Pool({ connectionString: databaseUrl });
const PgStore = connectPgSimple(session);
const store = new PgStore({ pool, createTableIfMissing: false });
const config = { sessionSecret: "test-secret-is-longer-than-thirty-two-characters", origin: "http://localhost:5173", production: false, trustProxy: false };
const app = createApp({ db, store, config });
const suffix = randomUUID().replaceAll("-", "");
const users = [];
const student = request.agent(app);
const professor = request.agent(app);
const other = request.agent(app);
const credentials = (role, prefix) => ({ fullName: `Test ${prefix}`, email: `${prefix}.${suffix}@ncsu.edu`, password: "TestPassword123!", role });
const studentInput = credentials("STUDENT", "student");
const professorInput = credentials("PROFESSOR", "professor");
const otherInput = credentials("PROFESSOR", "other");
const listing = {
  title: "Test research", description: "Test description", category: "Robotics",
  department: "Engineering", opportunityType: "Research Assistantship",
  requiredSkills: ["Python"], qualifications: ["Curiosity"], responsibilities: ["Research"],
  deadline: "2099-12-31", applicationUrl: null, contactEmail: professorInput.email,
};
let opportunityId;

before(async () => {
  await db.$connect();
  await pool.query('SELECT 1 FROM "session" LIMIT 1');
});

after(async () => {
  if (users.length) {
    await db.opportunity.deleteMany({ where: { professorId: { in: users } } });
    await pool.query('DELETE FROM "session" WHERE sess::jsonb ->> $1 = ANY($2::text[])', ["userId", users]);
    await db.user.deleteMany({ where: { id: { in: users } } });
  }
  store.close();
  await pool.end();
  await db.$disconnect();
});

test("registration validates role and email, hashes credentials, and prevents self-verification", async () => {
  for (const input of [studentInput, professorInput, otherInput]) {
    const res = await request(app).post("/api/auth/register").send(input).expect(201);
    users.push(res.body.data.id);
    assert.equal(res.body.data.role, input.role);
    assert.equal(res.body.data.professorVerified, false);
    assert.equal(res.body.data.passwordHash, undefined);
    const saved = await db.user.findUniqueOrThrow({ where: { id: res.body.data.id } });
    assert.notEqual(saved.passwordHash, input.password);
    assert.match(saved.passwordHash, /^\$2[aby]\$/);
  }
  await request(app).post("/api/auth/register").send({ ...studentInput, email: `bad.${suffix}@example.com` }).expect(400);
  await request(app).post("/api/auth/register").send({ ...studentInput, email: studentInput.email.toUpperCase() }).expect(409);
  await request(app).post("/api/auth/register").send({ ...studentInput, role: "ADMIN" }).expect(400);
  await request(app).post("/api/auth/register").send({ ...professorInput, professorVerified: true }).expect(400);
  await request(app).post("/api/auth/register").send({ ...studentInput, password: "é".repeat(37) }).expect(400);
});

test("login, persistent PostgreSQL sessions, logout and failed credentials", async () => {
  await student.post("/api/auth/login").send({ email: studentInput.email, password: "badpassword" }).expect(401);
  const res = await student.post("/api/auth/login").send({ email: studentInput.email, password: studentInput.password }).expect(200);
  assert.equal(res.body.data.passwordHash, undefined);
  const cookie = res.headers["set-cookie"][0];
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  const restartedStore = new PgStore({ pool, createTableIfMissing: false });
  const restartedApp = createApp({ db, store: restartedStore, config });
  const me = await request(restartedApp).get("/api/auth/me").set("Cookie", cookie.split(";")[0]).expect(200);
  assert.equal(me.body.data.id, users[0]);
  await student.post("/api/auth/logout").send({}).expect(200);
  await student.get("/api/auth/me").expect(401);
  await request(restartedApp).get("/api/auth/me").set("Cookie", cookie.split(";")[0]).expect(401);
  restartedStore.close();
  await student.post("/api/auth/login").send({ email: studentInput.email, password: studentInput.password }).expect(200);
  await professor.post("/api/auth/login").send({ email: professorInput.email, password: professorInput.password }).expect(200);
  await other.post("/api/auth/login").send({ email: otherInput.email, password: otherInput.password }).expect(200);
});

test("authorization protects professor APIs and derives verification from the database", async () => {
  await request(app).get("/api/professor/opportunities").expect(401);
  await student.get("/api/professor/opportunities").expect(403);
  await student.post("/api/professor/opportunities").send(listing).expect(403);
  await professor.get("/api/professor/opportunities").expect(200);
  await professor.post("/api/professor/opportunities").send(listing).expect(403);
  await db.user.update({ where: { id: users[1] }, data: { professorVerified: true } });
  const me = await professor.get("/api/auth/me").expect(200);
  assert.equal(me.body.data.professorVerified, true);
  await professor.post("/api/professor/opportunities").send({ ...listing, professorId: users[2] }).expect(400);
  await professor.post("/api/professor/opportunities").send({ ...listing, deadline: "2026-02-30" }).expect(400);
  await professor.post("/api/professor/opportunities").send({ ...listing, applicationUrl: "not-a-url" }).expect(400);
  const created = await professor.post("/api/professor/opportunities").send(listing).expect(201);
  opportunityId = created.body.data.id;
  assert.equal(created.body.data.professorId, users[1]);
  assert.equal(created.body.data.status, "OPEN");
  assert.equal(created.body.data.professor.passwordHash, undefined);
  assert.equal(created.body.data.location, null);
  assert.equal(created.body.data.hourlyPayCents, null);
  for (const hourlyPayCents of [-1, 0.1, 10000001, "2000"]) {
    await professor.post("/api/professor/opportunities").send({ ...listing, hourlyPayCents }).expect(400);
  }
  const paid = await professor.post("/api/professor/opportunities").send({ ...listing, location: "Remote", hourlyPayCents: 1875 }).expect(201);
  assert.equal(paid.body.data.location, "Remote");
  assert.equal(paid.body.data.hourlyPayCents, 1875);
  await professor.delete(`/api/professor/opportunities/${paid.body.data.id}`).send({}).expect(200);
});

test("public listing supports filtering, pagination and open-only detail", async () => {
  const response = await request(app).get("/api/opportunities").query({ search: "Test research", category: "robotics", page: 1, limit: 1 }).expect(200);
  assert.equal(response.body.data[0].id, opportunityId);
  assert.equal(response.body.pagination.limit, 1);
  await request(app).get(`/api/opportunities/${opportunityId}`).expect(200);
  await request(app).get("/api/opportunities").query({ limit: 101 }).expect(400);
  await request(app).get("/api/opportunities/not-a-uuid").expect(400);
});

test("only verified owners can edit, close, reopen and delete", async () => {
  await db.user.update({ where: { id: users[2] }, data: { professorVerified: true } });
  await other.put(`/api/professor/opportunities/${opportunityId}`).send(listing).expect(404);
  await other.patch(`/api/professor/opportunities/${opportunityId}/status`).send({ status: "CLOSED" }).expect(404);
  await other.delete(`/api/professor/opportunities/${opportunityId}`).send({}).expect(404);
  await student.put(`/api/professor/opportunities/${opportunityId}`).send(listing).expect(403);
  await student.patch(`/api/professor/opportunities/${opportunityId}/status`).send({ status: "CLOSED" }).expect(403);
  await student.delete(`/api/professor/opportunities/${opportunityId}`).send({}).expect(403);
  const updated = await professor.put(`/api/professor/opportunities/${opportunityId}`).send({ ...listing, title: "Updated", location: "Raleigh, NC", hourlyPayCents: 2050 }).expect(200);
  assert.equal(updated.body.data.title, "Updated");
  assert.equal(updated.body.data.location, "Raleigh, NC");
  assert.equal(updated.body.data.hourlyPayCents, 2050);
  const detail = await request(app).get(`/api/opportunities/${opportunityId}`).expect(200);
  assert.equal(detail.body.data.hourlyPayCents, 2050);
  const olderClient = await professor.put(`/api/professor/opportunities/${opportunityId}`).send(listing).expect(200);
  assert.equal(olderClient.body.data.hourlyPayCents, 2050);
  const zero = await professor.put(`/api/professor/opportunities/${opportunityId}`).send({ ...listing, location: null, hourlyPayCents: 0 }).expect(200);
  assert.equal(zero.body.data.hourlyPayCents, 0);
  const cleared = await professor.put(`/api/professor/opportunities/${opportunityId}`).send({ ...listing, hourlyPayCents: null }).expect(200);
  assert.equal(cleared.body.data.hourlyPayCents, null);
  await professor.patch(`/api/professor/opportunities/${opportunityId}/status`).send({ status: "CLOSED" }).expect(200);
  await request(app).get(`/api/opportunities/${opportunityId}`).expect(404);
  const own = await professor.get("/api/professor/opportunities").expect(200);
  assert.equal(own.body.data.find((item) => item.id === opportunityId).status, "CLOSED");
  await professor.patch(`/api/professor/opportunities/${opportunityId}/status`).send({ status: "OPEN" }).expect(200);
  await db.user.update({ where: { id: users[1] }, data: { professorVerified: false } });
  await professor.put(`/api/professor/opportunities/${opportunityId}`).send(listing).expect(403);
  await professor.patch(`/api/professor/opportunities/${opportunityId}/status`).send({ status: "CLOSED" }).expect(403);
  await professor.delete(`/api/professor/opportunities/${opportunityId}`).send({}).expect(403);
  await db.user.update({ where: { id: users[1] }, data: { professorVerified: true } });
  await professor.delete(`/api/professor/opportunities/${opportunityId}`).send({}).expect(200);
  await request(app).get(`/api/opportunities/${opportunityId}`).expect(404);
});

test("origin and content-type checks block cross-site requests", async () => {
  await request(app).post("/api/auth/login").set("Origin", "https://evil.example").send({ email: studentInput.email, password: studentInput.password }).expect(403);
  await request(app).post("/api/auth/logout").type("form").send({}).expect(415);
  const response = await request(app).get("/api/opportunities").set("Origin", config.origin).expect(200);
  assert.equal(response.headers["access-control-allow-origin"], config.origin);
  assert.equal(response.headers["access-control-allow-credentials"], "true");
});

test("production sessions use secure cookies behind the configured proxy", async () => {
  const productionApp = createApp({ db, store, config: { ...config, production: true, trustProxy: true, origin: "https://frontend.example" } });
  const response = await request(productionApp).post("/api/auth/login")
    .set("X-Forwarded-Proto", "https")
    .set("Origin", "https://frontend.example")
    .send({ email: studentInput.email, password: studentInput.password }).expect(200);
  assert.match(response.headers["set-cookie"][0], /;\s*Secure/i);
});
