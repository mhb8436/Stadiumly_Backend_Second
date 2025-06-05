/*
  Warnings:

  - You are about to drop the `AppleUSer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Recommendation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AppleUSer" DROP CONSTRAINT "AppleUSer_userID_fkey";

-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_reco_stadiumId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "user_like_staId" DROP DEFAULT;

-- DropTable
DROP TABLE "AppleUSer";

-- DropTable
DROP TABLE "Recommendation";

-- CreateTable
CREATE TABLE "AppleUser" (
    "app_user_id" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,

    CONSTRAINT "AppleUser_pkey" PRIMARY KEY ("app_user_id")
);

-- CreateTable
CREATE TABLE "PlayerRecommendation" (
    "reco_id" SERIAL NOT NULL,
    "reco_name" TEXT NOT NULL,
    "reco_image" TEXT NOT NULL,
    "reco_player" TEXT NOT NULL,
    "reco_add" TEXT NOT NULL,
    "reco_tp" TEXT NOT NULL,
    "reco_menu" TEXT NOT NULL,
    "reco_stadiumId" INTEGER NOT NULL,

    CONSTRAINT "PlayerRecommendation_pkey" PRIMARY KEY ("reco_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppleUser_userID_key" ON "AppleUser"("userID");

-- AddForeignKey
ALTER TABLE "AppleUser" ADD CONSTRAINT "AppleUser_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRecommendation" ADD CONSTRAINT "PlayerRecommendation_reco_stadiumId_fkey" FOREIGN KEY ("reco_stadiumId") REFERENCES "Stadium"("sta_id") ON DELETE RESTRICT ON UPDATE CASCADE;
