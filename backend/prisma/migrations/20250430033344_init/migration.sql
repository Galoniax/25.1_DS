-- CreateEnum
CREATE TYPE "Role" AS ENUM ('marketing', 'sucursal');

-- CreateTable
CREATE TABLE "Cliente" (
    "id_cliente" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "Sucursal" (
    "id_sucursal" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,

    CONSTRAINT "Sucursal_pkey" PRIMARY KEY ("id_sucursal")
);

-- CreateTable
CREATE TABLE "FuenteDatos" (
    "id_fuente" SERIAL NOT NULL,
    "id_sucursal" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "configuracion" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuenteDatos_pkey" PRIMARY KEY ("id_fuente")
);

-- CreateTable
CREATE TABLE "CategoriaProducto" (
    "id_categoria_producto" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "CategoriaProducto_pkey" PRIMARY KEY ("id_categoria_producto")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id_producto" SERIAL NOT NULL,
    "id_categoria_producto" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id_stock" SERIAL NOT NULL,
    "id_sucursal" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id_stock")
);

-- CreateTable
CREATE TABLE "MovimientoStock" (
    "id_movimiento_stock" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "id_stock" INTEGER NOT NULL,

    CONSTRAINT "MovimientoStock_pkey" PRIMARY KEY ("id_movimiento_stock")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id_venta" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_sucursal" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id_venta")
);

-- CreateTable
CREATE TABLE "VentaProducto" (
    "id_venta_producto" SERIAL NOT NULL,
    "id_venta" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_movimiento_stock" INTEGER NOT NULL,
    "nombre_producto" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "VentaProducto_pkey" PRIMARY KEY ("id_venta_producto")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id_reporte" SERIAL NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL,
    "ruta_archivo" TEXT NOT NULL,
    "id_sucursal" INTEGER,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id_reporte")
);

-- CreateTable
CREATE TABLE "User" (
    "id_user" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "id_sucursal" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE INDEX "idx_cliente_email" ON "Cliente"("email");

-- CreateIndex
CREATE INDEX "idx_fuente_datos_id_sucursal" ON "FuenteDatos"("id_sucursal");

-- CreateIndex
CREATE INDEX "idx_producto_nombre" ON "Producto"("nombre");

-- CreateIndex
CREATE INDEX "idx_producto_precio" ON "Producto"("precio");

-- CreateIndex
CREATE INDEX "idx_stock_id_sucursal" ON "Stock"("id_sucursal");

-- CreateIndex
CREATE INDEX "idx_stock_id_producto" ON "Stock"("id_producto");

-- CreateIndex
CREATE INDEX "idx_movimiento_stock_id_stock" ON "MovimientoStock"("id_stock");

-- CreateIndex
CREATE INDEX "idx_venta_id_cliente" ON "Venta"("id_cliente");

-- CreateIndex
CREATE INDEX "idx_venta_id_sucursal" ON "Venta"("id_sucursal");

-- CreateIndex
CREATE INDEX "idx_venta_producto_id_venta" ON "VentaProducto"("id_venta");

-- CreateIndex
CREATE INDEX "idx_venta_producto_id_producto" ON "VentaProducto"("id_producto");

-- CreateIndex
CREATE INDEX "idx_venta_producto_id_movimiento_stock" ON "VentaProducto"("id_movimiento_stock");

-- CreateIndex
CREATE INDEX "idx_reporte_id_sucursal" ON "Reporte"("id_sucursal");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_user_id_sucursal" ON "User"("id_sucursal");

-- AddForeignKey
ALTER TABLE "FuenteDatos" ADD CONSTRAINT "FuenteDatos_id_sucursal_fkey" FOREIGN KEY ("id_sucursal") REFERENCES "Sucursal"("id_sucursal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_id_categoria_producto_fkey" FOREIGN KEY ("id_categoria_producto") REFERENCES "CategoriaProducto"("id_categoria_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_id_sucursal_fkey" FOREIGN KEY ("id_sucursal") REFERENCES "Sucursal"("id_sucursal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoStock" ADD CONSTRAINT "MovimientoStock_id_stock_fkey" FOREIGN KEY ("id_stock") REFERENCES "Stock"("id_stock") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_id_sucursal_fkey" FOREIGN KEY ("id_sucursal") REFERENCES "Sucursal"("id_sucursal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaProducto" ADD CONSTRAINT "VentaProducto_id_venta_fkey" FOREIGN KEY ("id_venta") REFERENCES "Venta"("id_venta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaProducto" ADD CONSTRAINT "VentaProducto_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaProducto" ADD CONSTRAINT "VentaProducto_id_movimiento_stock_fkey" FOREIGN KEY ("id_movimiento_stock") REFERENCES "MovimientoStock"("id_movimiento_stock") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_id_sucursal_fkey" FOREIGN KEY ("id_sucursal") REFERENCES "Sucursal"("id_sucursal") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_sucursal_fkey" FOREIGN KEY ("id_sucursal") REFERENCES "Sucursal"("id_sucursal") ON DELETE SET NULL ON UPDATE CASCADE;
