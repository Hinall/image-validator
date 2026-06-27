-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageUrl" TEXT,
    "format" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);
