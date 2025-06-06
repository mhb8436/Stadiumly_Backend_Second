-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "user_cus_id" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_pwd" TEXT NOT NULL,
    "user_nick" CHAR(20) NOT NULL,
    "user_grade" INTEGER NOT NULL DEFAULT 0,
    "user_status" INTEGER NOT NULL DEFAULT 0,
    "user_refreshtoken" TEXT,
    "user_like_staId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "AnonyUser" (
    "ano_id" SERIAL NOT NULL,
    "ano_uuid" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,

    CONSTRAINT "AnonyUser_pkey" PRIMARY KEY ("ano_id")
);

-- CreateTable
CREATE TABLE "AppleUser" (
    "app_user_id" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,

    CONSTRAINT "AppleUser_pkey" PRIMARY KEY ("app_user_id")
);

-- CreateTable
CREATE TABLE "Favorit" (
    "fav_id" SERIAL NOT NULL,
    "fa_user_id" INTEGER NOT NULL,
    "fa_sta_id" INTEGER NOT NULL,

    CONSTRAINT "Favorit_pkey" PRIMARY KEY ("fav_id")
);

-- CreateTable
CREATE TABLE "Stadium" (
    "sta_id" SERIAL NOT NULL,
    "sta_image" TEXT NOT NULL,
    "sta_lati" DOUBLE PRECISION NOT NULL,
    "sta_long" DOUBLE PRECISION NOT NULL,
    "sta_name" TEXT NOT NULL,
    "sta_team" TEXT NOT NULL,

    CONSTRAINT "Stadium_pkey" PRIMARY KEY ("sta_id")
);

-- CreateTable
CREATE TABLE "PlayerRecommendation" (
    "reco_id" SERIAL NOT NULL,
    "reco_name" TEXT NOT NULL,
    "reco_image" TEXT NOT NULL,
    "reco_player" TEXT,
    "reco_add" TEXT NOT NULL,
    "reco_tp" TEXT NOT NULL,
    "reco_menu" TEXT NOT NULL,
    "reco_stadiumId" INTEGER NOT NULL,

    CONSTRAINT "PlayerRecommendation_pkey" PRIMARY KEY ("reco_id")
);

-- CreateTable
CREATE TABLE "Cafeteria" (
    "cafe_id" SERIAL NOT NULL,
    "cafe_name" TEXT NOT NULL,
    "cafe_image" TEXT NOT NULL,
    "cafe_location" TEXT NOT NULL,
    "cafe_floor" INTEGER NOT NULL,
    "cafe_category" TEXT NOT NULL,
    "cafe_stadiumId" INTEGER NOT NULL,

    CONSTRAINT "Cafeteria_pkey" PRIMARY KEY ("cafe_id")
);

-- CreateTable
CREATE TABLE "StartPitcher" (
    "id" SERIAL NOT NULL,
    "pit_game_id" TEXT NOT NULL,
    "pit_home_team" TEXT NOT NULL,
    "pit_home_name" TEXT NOT NULL,
    "pit_home_image" TEXT NOT NULL,
    "pit_away_name" TEXT NOT NULL,
    "pit_away_team" TEXT NOT NULL,
    "pit_away_image" TEXT NOT NULL,
    "pit_game_time" TEXT NOT NULL,
    "pit_broad_image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StartPitcher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatRoomId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT,
    "metadata" JSONB,
    "embedding" vector,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChatRoomToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ChatRoomToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_cus_id_key" ON "User"("user_cus_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_email_key" ON "User"("user_email");

-- CreateIndex
CREATE UNIQUE INDEX "AnonyUser_ano_uuid_key" ON "AnonyUser"("ano_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "AnonyUser_userID_key" ON "AnonyUser"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "AppleUser_userID_key" ON "AppleUser"("userID");

-- CreateIndex
CREATE INDEX "_ChatRoomToUser_B_index" ON "_ChatRoomToUser"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_user_like_staId_fkey" FOREIGN KEY ("user_like_staId") REFERENCES "Stadium"("sta_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnonyUser" ADD CONSTRAINT "AnonyUser_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppleUser" ADD CONSTRAINT "AppleUser_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorit" ADD CONSTRAINT "fk_favorit_to_stadium" FOREIGN KEY ("fa_sta_id") REFERENCES "Stadium"("sta_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorit" ADD CONSTRAINT "fk_favorit_to_user" FOREIGN KEY ("fa_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRecommendation" ADD CONSTRAINT "PlayerRecommendation_reco_stadiumId_fkey" FOREIGN KEY ("reco_stadiumId") REFERENCES "Stadium"("sta_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cafeteria" ADD CONSTRAINT "Cafeteria_cafe_stadiumId_fkey" FOREIGN KEY ("cafe_stadiumId") REFERENCES "Stadium"("sta_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomToUser" ADD CONSTRAINT "_ChatRoomToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomToUser" ADD CONSTRAINT "_ChatRoomToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
