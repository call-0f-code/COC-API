/*
  Warnings:

  - The `birth_date` column on the `Member` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Member" DROP COLUMN "birth_date",
ADD COLUMN     "birth_date" DATE;
