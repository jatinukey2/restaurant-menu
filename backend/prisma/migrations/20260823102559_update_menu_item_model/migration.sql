/*
  Warnings:

  - Changed the type of `category` on the `menu_items` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('STARTER', 'MAIN_COURSE', 'DESSERT', 'BEVERAGE', 'SIDE');

-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "isGlutenFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVegan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVegetarian" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prepTime" INTEGER,
ADD COLUMN     "spicyLevel" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "category",
ADD COLUMN     "category" "Category" NOT NULL;
