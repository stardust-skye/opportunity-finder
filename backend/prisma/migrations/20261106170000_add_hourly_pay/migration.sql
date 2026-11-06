ALTER TABLE "Opportunity"
ADD COLUMN "hourlyPayCents" INTEGER,
ADD CONSTRAINT "Opportunity_hourlyPayCents_range"
CHECK ("hourlyPayCents" IS NULL OR "hourlyPayCents" BETWEEN 0 AND 10000000);
