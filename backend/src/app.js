import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import bcrypt from "bcrypt";
import { rateLimit } from "express-rate-limit";
import { errorHandler, HttpError, publicUserSelect, requireAuth, requireProfessor, requireVerifiedProfessor, requireOpportunityOwner } from "./middleware.js";
import { idSchema, loginSchema, opportunitySchema, paginationSchema, registerSchema, statusSchema } from "./validators.js";

const publicProfessor = { id: true, fullName: true };
const opportunityInclude = { professor: { select: publicProfessor } };
const day = 24 * 60 * 60 * 1000;
const dummyPasswordHash = "$2b$12$tirstddFNv8UOXIV1hlL8ee9HUjF1lJSVXiDUcnzxXCw8JJ.R1Brq";

function regenerate(req) {
  return new Promise((resolve, reject) => req.session.regenerate((error) => error ? reject(error) : resolve()));
}
function save(req) {
  return new Promise((resolve, reject) => req.session.save((error) => error ? reject(error) : resolve()));
}
function destroy(req) {
  return new Promise((resolve, reject) => req.session.destroy((error) => error ? reject(error) : resolve()));
}

export function createApp({ db, store, config }) {
  const app = express();
  if (config.trustProxy) app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet());
  app.use((req, res, next) => {
    if (req.headers.origin && req.headers.origin !== config.origin) return next(new HttpError(403, "Origin not allowed."));
    next();
  });
  app.use(cors({ origin: config.origin, credentials: true }));
  app.use(express.json({ limit: "32kb" }));
  app.use(session({
    name: "opportunity.sid",
    secret: config.sessionSecret,
    store,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: config.production, sameSite: "lax", maxAge: day, path: "/" },
  }));
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && !req.is("application/json")) {
      return next(new HttpError(415, "Content-Type must be application/json."));
    }
    next();
  });

  const auth = requireAuth(db);
  const professor = [auth, requireProfessor];
  const manager = [auth, requireProfessor, requireVerifiedProfessor];
  const owner = requireOpportunityOwner(db);
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ error: { message: "Too many authentication attempts. Try again later." } }),
  });

  app.post("/api/auth/register", authLimiter, async (req, res) => {
    const input = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await db.user.create({ data: { fullName: input.fullName, email: input.email, role: input.role, passwordHash }, select: publicUserSelect });
    res.status(201).json({ data: user });
  });
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await db.user.findUnique({ where: { email: input.email } });
    const matches = await bcrypt.compare(input.password, user?.passwordHash || dummyPasswordHash);
    if (!user || !matches) throw new HttpError(401, "Invalid email or password.");
    await regenerate(req);
    req.session.userId = user.id;
    await save(req);
    const { passwordHash, ...safeUser } = user;
    res.json({ data: safeUser });
  });
  app.get("/api/auth/me", auth, (req, res) => res.json({ data: req.user }));
  app.post("/api/auth/logout", async (req, res) => {
    await destroy(req);
    res.clearCookie("opportunity.sid", { httpOnly: true, secure: config.production, sameSite: "lax", path: "/" });
    res.json({ data: { message: "Logged out." } });
  });

  app.get("/api/opportunities", async (req, res) => {
    const { page, limit, search, category } = paginationSchema.parse(req.query);
    const where = {
      status: "OPEN",
      ...(category ? { category: { equals: category, mode: "insensitive" } } : {}),
      ...(search ? { OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { professor: { fullName: { contains: search, mode: "insensitive" } } },
      ] } : {}),
    };
    const [items, total] = await db.$transaction([
      db.opportunity.findMany({ where, include: opportunityInclude, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * limit, take: limit }),
      db.opportunity.count({ where }),
    ]);
    res.json({ data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  });
  app.get("/api/opportunities/:id", async (req, res) => {
    const opportunity = await db.opportunity.findFirst({ where: { id: idSchema.parse(req.params.id), status: "OPEN" }, include: opportunityInclude });
    if (!opportunity) throw new HttpError(404, "Opportunity not found.");
    res.json({ data: opportunity });
  });
  app.get("/api/professor/opportunities", ...professor, async (req, res) => {
    const { page, limit } = paginationSchema.pick({ page: true, limit: true }).parse(req.query);
    const where = { professorId: req.user.id };
    const [items, total] = await db.$transaction([
      db.opportunity.findMany({ where, include: opportunityInclude, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * limit, take: limit }),
      db.opportunity.count({ where }),
    ]);
    res.json({ data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  });
  app.post("/api/professor/opportunities", ...manager, async (req, res) => {
    const input = opportunitySchema.parse(req.body);
    const item = await db.opportunity.create({ data: { ...input, deadline: new Date(`${input.deadline}T00:00:00.000Z`), professorId: req.user.id }, include: opportunityInclude });
    res.status(201).json({ data: item });
  });
  app.put("/api/professor/opportunities/:id", ...manager, owner, async (req, res) => {
    const input = opportunitySchema.parse(req.body);
    const result = await db.opportunity.updateMany({ where: { id: req.params.id, professorId: req.user.id }, data: {
      ...input,
      applicationUrl: input.applicationUrl ?? null,
      location: input.location ?? null,
      commitment: input.commitment ?? null,
      objectives: input.objectives ?? [],
      applicationInstructions: input.applicationInstructions ?? null,
      deadline: new Date(`${input.deadline}T00:00:00.000Z`),
    } });
    if (!result.count) throw new HttpError(404, "Opportunity not found.");
    const item = await db.opportunity.findFirst({ where: { id: req.params.id, professorId: req.user.id }, include: opportunityInclude });
    if (!item) throw new HttpError(404, "Opportunity not found.");
    res.json({ data: item });
  });
  app.patch("/api/professor/opportunities/:id/status", ...manager, owner, async (req, res) => {
    const { status } = statusSchema.parse(req.body);
    const result = await db.opportunity.updateMany({ where: { id: req.params.id, professorId: req.user.id }, data: { status } });
    if (!result.count) throw new HttpError(404, "Opportunity not found.");
    res.json({ data: { id: req.params.id, status } });
  });
  app.delete("/api/professor/opportunities/:id", ...manager, owner, async (req, res) => {
    const result = await db.opportunity.deleteMany({ where: { id: req.params.id, professorId: req.user.id } });
    if (!result.count) throw new HttpError(404, "Opportunity not found.");
    res.json({ data: { message: "Opportunity deleted." } });
  });
  app.use((req, res) => res.status(404).json({ error: { message: "Route not found." } }));
  app.use(errorHandler);
  return app;
}
