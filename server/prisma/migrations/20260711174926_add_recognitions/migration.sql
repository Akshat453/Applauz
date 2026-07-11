-- CreateTable
CREATE TABLE "recognition_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "icon" VARCHAR(255),
    "default_points" INTEGER NOT NULL,

    CONSTRAINT "recognition_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recognitions" (
    "id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "receiver_id" UUID NOT NULL,
    "category_id" UUID,
    "message" TEXT NOT NULL,
    "points_recommended" INTEGER,
    "points_awarded" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "approver_id" UUID,
    "rejection_reason" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "visibility" VARCHAR(50) NOT NULL DEFAULT 'public',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recognitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recognition_categories_name_key" ON "recognition_categories"("name");

-- AddForeignKey
ALTER TABLE "recognitions" ADD CONSTRAINT "recognitions_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognitions" ADD CONSTRAINT "recognitions_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognitions" ADD CONSTRAINT "recognitions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "recognition_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognitions" ADD CONSTRAINT "recognitions_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
