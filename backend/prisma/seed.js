import "dotenv/config";
import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { opportunities } from "../../src/data/opportunities.js";

if (process.env.NODE_ENV !== "development") {
  throw new Error("The demo seed may only run with NODE_ENV=development.");
}

const db = new PrismaClient();
const passwordHash = await bcrypt.hash("DemoPass123!", 12);

try {
  for (const [email, fullName, role] of [
    ["student@ncsu.edu", "Demo Student", "STUDENT"],
    ["professor@ncsu.edu", "Demo Professor", "PROFESSOR"],
  ]) {
    const user = await db.user.upsert({
      where: { email },
      update: {},
      create: { email, fullName, role, passwordHash },
    });
    if (user.role !== role) throw new Error(`Existing development account ${email} has an unexpected role.`);
  }
  for (const [index, item] of opportunities.slice(0, 7).entries()) {
    const id = `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
    const email = `seed-professor-${index + 1}@ncsu.edu`;
    const owner = await db.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        fullName: item.professor,
        role: "PROFESSOR",
        passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"), 12),
      },
    });
    if (owner.role !== "PROFESSOR") throw new Error(`Existing sample owner ${email} is not a professor.`);
    const contactEmail = item.applicationHref.slice(7).split("?")[0];
    await db.opportunity.upsert({
      where: { id },
      update: {},
      create: {
        id,
        title: item.title,
        description: item.description,
        category: item.category,
        department: item.department,
        opportunityType: item.type,
        requiredSkills: item.skills,
        qualifications: item.qualifications,
        responsibilities: item.responsibilities,
        deadline: new Date(`${item.deadline}T00:00:00.000Z`),
        contactEmail,
        professorId: owner.id,
        location: item.location,
        commitment: item.commitment,
        objectives: item.objectives,
        applicationInstructions: item.applicationInstructions,
        createdAt: new Date(`${item.postedAt}T00:00:00.000Z`),
      },
    });
  }
  console.log("Development demo accounts and seven sample opportunities are ready.");
} finally {
  await db.$disconnect();
}
