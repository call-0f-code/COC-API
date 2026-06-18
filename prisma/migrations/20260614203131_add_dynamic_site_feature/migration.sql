-- CreateTable
CREATE TABLE "SitePageContent" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "heroImageUrl" TEXT,
    "heroCaption" TEXT,
    "heroAltText" TEXT,
    "galleryPhotos" JSONB NOT NULL DEFAULT '[]',
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SitePageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteAction" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT,
    "url" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteAction_key_key" ON "SiteAction"("key");

-- AddForeignKey
ALTER TABLE "SitePageContent" ADD CONSTRAINT "SitePageContent_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteAction" ADD CONSTRAINT "SiteAction_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
