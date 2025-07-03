/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `CategoriaProducto` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CategoriaProducto_nombre_key" ON "CategoriaProducto"("nombre");
