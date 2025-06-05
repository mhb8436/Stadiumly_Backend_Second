-- AlterTable
ALTER TABLE "PlayerRecommendation" ALTER COLUMN "reco_player" DROP NOT NULL;

-- CreateTable
CREATE TABLE "recommendations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT,
    "metadata" JSONB,
    "embedding" vector,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);
