import { z } from "zod";

const email = z.string().trim().max(254).email().toLowerCase()
  .refine((value) => value.endsWith("@ncsu.edu"), "Use an @ncsu.edu email address.");
const password = z.string().min(8).refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password must be at most 72 UTF-8 bytes.");
const text = (max) => z.string().trim().min(1).max(max);
const lines = z.array(text(500)).min(1).max(30);
const optionalText = (max) => text(max).nullable().optional();

export const registerSchema = z.object({
  fullName: text(120),
  email,
  password,
  role: z.enum(["STUDENT", "PROFESSOR"]),
}).strict();

export const loginSchema = z.object({ email, password }).strict();
export const idSchema = z.string().uuid();
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  category: z.string().trim().max(120).optional(),
}).strict();

export const opportunitySchema = z.object({
  title: text(120),
  description: text(1500),
  category: text(120),
  department: text(120),
  opportunityType: text(120),
  requiredSkills: z.array(text(100)).min(1).max(30),
  qualifications: lines,
  responsibilities: lines,
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
  }, "Enter a valid date in YYYY-MM-DD format."),
  applicationUrl: z.string().trim().max(2048).url().refine((value) => {
    if (!URL.canParse(value)) return false;
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password;
  }, "Use an HTTP(S) URL without credentials.").nullable().optional(),
  contactEmail: email,
  location: optionalText(120),
  hourlyPayCents: z.number().int().min(0).max(10000000).nullable().optional(),
  commitment: optionalText(120),
  objectives: z.array(text(500)).max(30).optional(),
  applicationInstructions: optionalText(1500),
}).strict();
export const statusSchema = z.object({ status: z.enum(["OPEN", "CLOSED"]) }).strict();
