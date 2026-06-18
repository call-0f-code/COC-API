-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "ghostedById" TEXT,
ADD COLUMN     "isGhosted" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_ghostedById_fkey" FOREIGN KEY ("ghostedById") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
