/*
  Warnings:

  - You are about to drop the column `sta_id` on the `Favorit` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Favorit` table. All the data in the column will be lost.
  - Added the required column `fa_sta_id` to the `Favorit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fa_user_id` to the `Favorit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Favorit` DROP FOREIGN KEY `Favorit_sta_id_fkey`;

-- DropForeignKey
ALTER TABLE `Favorit` DROP FOREIGN KEY `Favorit_user_id_fkey`;

-- DropIndex
DROP INDEX `Favorit_sta_id_fkey` ON `Favorit`;

-- DropIndex
DROP INDEX `Favorit_user_id_fkey` ON `Favorit`;

-- AlterTable
ALTER TABLE `Favorit` DROP COLUMN `sta_id`,
    DROP COLUMN `user_id`,
    ADD COLUMN `fa_sta_id` INTEGER NOT NULL,
    ADD COLUMN `fa_user_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Favorit` ADD CONSTRAINT `fk_favorit_to_stadium` FOREIGN KEY (`fa_sta_id`) REFERENCES `Stadium`(`sta_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorit` ADD CONSTRAINT `fk_favorit_to_user` FOREIGN KEY (`fa_user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
