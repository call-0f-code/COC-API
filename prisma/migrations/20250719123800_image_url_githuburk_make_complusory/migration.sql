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
