CREATE TYPE "Role" AS ENUM ('STUDENT', 'PROFESSOR');
CREATE TYPE "OpportunityStatus" AS ENUM ('OPEN', 'CLOSED');

CREATE TABLE "User" (
  "id" UUID NOT NULL,
  "fullName" VARCHAR(120) NOT NULL,
  "email" VARCHAR(254) NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "professorVerified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "User_email_normalized" CHECK ("email" = lower("email")),
  CONSTRAINT "User_student_unverified" CHECK ("role" = 'PROFESSOR' OR NOT "professorVerified")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Opportunity" (
  "id" UUID NOT NULL,
  "title" VARCHAR(120) NOT NULL,
  "description" VARCHAR(1500) NOT NULL,
  "category" VARCHAR(120) NOT NULL,
  "department" VARCHAR(120) NOT NULL,
  "opportunityType" VARCHAR(120) NOT NULL,
  "requiredSkills" TEXT[] NOT NULL,
  "qualifications" TEXT[] NOT NULL,
  "responsibilities" TEXT[] NOT NULL,
  "deadline" DATE NOT NULL,
  "applicationUrl" VARCHAR(2048),
  "contactEmail" VARCHAR(254) NOT NULL,
  "status" "OpportunityStatus" NOT NULL DEFAULT 'OPEN',
  "professorId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  "location" VARCHAR(120),
  "commitment" VARCHAR(120),
  "objectives" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "applicationInstructions" VARCHAR(1500),
  CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Opportunity_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "Opportunity_status_createdAt_idx" ON "Opportunity"("status", "createdAt");
CREATE INDEX "Opportunity_status_category_idx" ON "Opportunity"("status", "category");
CREATE INDEX "Opportunity_professorId_createdAt_idx" ON "Opportunity"("professorId", "createdAt");

CREATE TABLE "session" (
  "sid" VARCHAR NOT NULL PRIMARY KEY,
  "sess" JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL
);
CREATE INDEX "IDX_session_expire" ON "session" ("expire");
