-- CreateTable
CREATE TABLE "points_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "source_type" VARCHAR(50) NOT NULL,
    "source_id" UUID,
    "points" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_budget" (
    "id" UUID NOT NULL,
    "manager_id" UUID NOT NULL,
    "allocated_points" INTEGER NOT NULL,
    "used_points" INTEGER NOT NULL DEFAULT 0,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,

    CONSTRAINT "points_budget_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "points_transactions" ADD CONSTRAINT "points_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_transactions" ADD CONSTRAINT "points_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_budget" ADD CONSTRAINT "points_budget_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
