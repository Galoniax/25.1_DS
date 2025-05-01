import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Crear una sucursal
  const sucursal = await prisma.sucursal.create({
    data: {
      nombre: 'Sucursal Central',
      ubicacion: 'Av. Principal 123',
    },
  });

  // 2. Crear un cliente
  const cliente = await prisma.cliente.create({
    data: {
      nombre: 'Juan Pérez',
      email: 'juan.perez@example.com',
      telefono: '123456789',
      fecha_registro: new Date(),
    },
  });

  // 3. Crear categoría de producto
  const categoria = await prisma.categoriaProducto.create({
    data: {
      nombre: 'Electrónica',
    },
  });

  // 4. Crear productos
  const producto1 = await prisma.producto.create({
    data: {
      nombre: 'Auriculares Bluetooth',
      precio: 100.0,
      descripcion: 'Auriculares inalámbricos con micrófono',
      id_categoria_producto: categoria.id_categoria_producto,
    },
  });

  const producto2 = await prisma.producto.create({
    data: {
      nombre: 'Mouse Gamer',
      precio: 50.0,
      descripcion: 'Mouse con luces RGB y alta precisión',
      id_categoria_producto: categoria.id_categoria_producto,
    },
  });

  // 5. Crear stock para los productos
  const stock1 = await prisma.stock.create({
    data: {
      id_sucursal: sucursal.id_sucursal,
      id_producto: producto1.id_producto,
      cantidad: 10,
    },
  });

  const stock2 = await prisma.stock.create({
    data: {
      id_sucursal: sucursal.id_sucursal,
      id_producto: producto2.id_producto,
      cantidad: 15,
    },
  });

  // 6. Crear movimientos de stock
  const movimiento1 = await prisma.movimientoStock.create({
    data: {
      id_stock: stock1.id_stock,
      cantidad: -1, // se vendió uno
    },
  });

  const movimiento2 = await prisma.movimientoStock.create({
    data: {
      id_stock: stock2.id_stock,
      cantidad: -2, // se vendieron dos
    },
  });

  // 7. Crear una venta
  const venta = await prisma.venta.create({
    data: {
      id_cliente: cliente.id_cliente,
      id_sucursal: sucursal.id_sucursal,
      fecha: new Date(),
      total: 200.0, // 1x100 + 2x50
    },
  });

  // 8. Crear ventaProducto (detalles de la venta)
  await prisma.ventaProducto.createMany({
    data: [
      {
        id_venta: venta.id_venta,
        id_producto: producto1.id_producto,
        id_movimiento_stock: movimiento1.id_movimiento_stock,
        nombre_producto: producto1.nombre,
        cantidad: 1,
        precio_unitario: 100.0,
      },
      {
        id_venta: venta.id_venta,
        id_producto: producto2.id_producto,
        id_movimiento_stock: movimiento2.id_movimiento_stock,
        nombre_producto: producto2.nombre,
        cantidad: 2,
        precio_unitario: 50.0,
      },
    ],
  });

  console.log('✔ Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error inserting seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });