/*
  Warnings:

  - Made the column `providerId` on table `fotion_user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "fotion_user" ALTER COLUMN "providerId" SET NOT NULL;
