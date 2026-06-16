/*
  Warnings:

  - You are about to drop the column `isManager` on the `Member` table. All the data in the column will be lost.

*/
-- 1. Create the Role enum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'FOUNDER', 'MEMBER');

-- 2. Add the new role column (nullable initially, no default yet)
ALTER TABLE "Member" ADD COLUMN "role" "Role";

-- 3. Backfill: convert isManager → role
UPDATE "Member" SET "role" = CASE
    WHEN "isManager" = true THEN 'ADMIN'::"Role"
    ELSE 'MEMBER'::"Role"
END;

-- 4. Now make it NOT NULL with a default
ALTER TABLE "Member" ALTER COLUMN "role" SET NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "role" SET DEFAULT 'MEMBER'::"Role";

-- 5. Drop the old column
ALTER TABLE "Member" DROP COLUMN "isManager";
