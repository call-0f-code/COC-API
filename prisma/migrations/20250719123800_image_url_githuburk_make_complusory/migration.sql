<<<<<<< HEAD
/*
  Warnings:

  - Made the column `imageUrl` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `githubUrl` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "imageUrl" SET NOT NULL,
ALTER COLUMN "githubUrl" SET NOT NULL;
=======
-- Check for nulls before altering
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Project" WHERE "imageUrl" IS NULL OR "githubUrl" IS NULL) THEN
        RAISE EXCEPTION 'Migration aborted: Some rows in "Project" have NULL in "imageUrl" or "githubUrl"';
    END IF;
END
$$;

-- AlterTable safely
ALTER TABLE "Project"
  ALTER COLUMN "imageUrl" SET NOT NULL,
  ALTER COLUMN "githubUrl" SET NOT NULL;
>>>>>>> d9f9fbb98f85a841e054fb70ac321b5195d50c9b
