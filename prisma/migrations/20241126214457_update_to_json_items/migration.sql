/*
  Warnings:

  - Added the required column `name` to the `EmailTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailTemplate" ADD COLUMN     "design" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;
