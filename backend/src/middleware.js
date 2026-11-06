import { ZodError } from "zod";
import { idSchema } from "./validators.js";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const publicUserSelect = {
  id: true, fullName: true, email: true, role: true, professorVerified: true, createdAt: true, updatedAt: true,
};

export function requireAuth(db) {
  return async (req, res, next) => {
    if (!req.session.userId) throw new HttpError(401, "Authentication required.");
    const user = await db.user.findUnique({ where: { id: req.session.userId }, select: publicUserSelect });
    if (!user) throw new HttpError(401, "Authentication required.");
    req.user = user;
    next();
  };
}

export function requireProfessor(req, res, next) {
  if (req.user.role !== "PROFESSOR") throw new HttpError(403, "Professor account required.");
  next();
}

export function requireVerifiedProfessor(req, res, next) {
  if (!req.user.professorVerified) throw new HttpError(403, "Professor verification required.");
  next();
}

export function requireOpportunityOwner(db) {
  return async (req, res, next) => {
    const id = idSchema.parse(req.params.id);
    const opportunity = await db.opportunity.findFirst({ where: { id, professorId: req.user.id }, select: { id: true } });
    if (!opportunity) throw new HttpError(404, "Opportunity not found.");
    next();
  };
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof ZodError) {
    return res.status(400).json({ error: { message: "Invalid request.", details: error.issues.map(({ path, message }) => ({ field: path.join("."), message })) } });
  }
  if (error instanceof HttpError) return res.status(error.status).json({ error: { message: error.message } });
  if (error.code === "P2002") return res.status(409).json({ error: { message: "An account with this email already exists." } });
  if (error.type === "entity.parse.failed") return res.status(400).json({ error: { message: "Malformed JSON." } });
  if (error.type === "entity.too.large") return res.status(413).json({ error: { message: "Request body is too large." } });
  console.error("API error:", error);
  return res.status(500).json({ error: { message: "An unexpected server error occurred." } });
}
