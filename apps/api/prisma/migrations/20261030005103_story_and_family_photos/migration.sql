-- AlterTable
ALTER TABLE "Wedding" ADD COLUMN     "brideFamilyPhotoUrl" TEXT,
ADD COLUMN     "groomFamilyPhotoUrl" TEXT;

-- CreateTable
CREATE TABLE "StoryMoment" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "momentDate" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryMoment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoryMoment_weddingId_order_idx" ON "StoryMoment"("weddingId", "order");

-- AddForeignKey
ALTER TABLE "StoryMoment" ADD CONSTRAINT "StoryMoment_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
