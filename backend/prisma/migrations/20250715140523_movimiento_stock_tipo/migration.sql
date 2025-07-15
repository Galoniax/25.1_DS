/*
  Warnings:

  - Added the required column `tipo` to the `MovimientoStock` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MovimientoStockTipo" AS ENUM ('entrada', 'salida');

-- AlterTable
ALTER TABLE "MovimientoStock" ADD COLUMN     "tipo" "MovimientoStockTipo" NOT NULL;
