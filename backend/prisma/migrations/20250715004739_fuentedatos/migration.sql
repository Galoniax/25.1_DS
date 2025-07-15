/*
  Warnings:

  - Changed the type of `tipo` on the `FuenteDatos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "FuenteDatosTipo" AS ENUM ('api', 'csv', 'excel', 'json', 'xml');

-- AlterTable
ALTER TABLE "FuenteDatos" DROP COLUMN "tipo",
ADD COLUMN     "tipo" "FuenteDatosTipo" NOT NULL;
