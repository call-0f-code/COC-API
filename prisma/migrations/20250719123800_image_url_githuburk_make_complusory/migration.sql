/*
  Warnings:

  - Made the column `imageUrl` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `githubUrl` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "imageUrl" SET NOT NULL,
ALTER COLUMN "githubUrl" SET NOT NULL;