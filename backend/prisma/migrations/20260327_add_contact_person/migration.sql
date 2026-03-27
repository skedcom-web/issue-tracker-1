-- Add contactPersonId to issues table
ALTER TABLE "issues" ADD COLUMN "contactPersonId" TEXT;
CREATE INDEX "issues_contactPersonId_idx" ON "issues"("contactPersonId");
