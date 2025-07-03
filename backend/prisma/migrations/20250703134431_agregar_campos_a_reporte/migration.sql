/*
  Warnings:

  - Added the required column `nombre_archivo` to the `Reporte` table without a default value. This is not possible if the table is not empty.
  - Added the required column `peso_archivo` to the `Reporte` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registros` to the `Reporte` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reporte" ADD COLUMN     "nombre_archivo" TEXT NOT NULL,
ADD COLUMN     "peso_archivo" INTEGER NOT NULL,
ADD COLUMN     "registros" INTEGER NOT NULL;
