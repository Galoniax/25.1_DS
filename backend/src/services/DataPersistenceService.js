import { prisma } from "../providers/prisma.js";

export class DataPersistenceService {
  async procesarLote(datos) {
    let procesados = 0;
    let errores = 0;

    for (const item of datos) {
      try {
        const cliente = item.cliente || {
          email: item.cliente_email,
          nombre: item.cliente_nombre,
          telefono: item.cliente_telefono || "",
          fecha_registro: item.fecha_registro,
        };

        const sucursal = item.sucursal || {
          nombre: item.nombre_sucursal,
        };

        const venta = item.venta || {
          fecha: item.fecha,
          total:
            parseFloat(item.total_venta) ||
            parseFloat(item.precio_unitario) * parseInt(item.cantidad),
        };

        const producto = item.producto || {
          nombre: item.nombre_producto,
          categoria: item.categoria_producto || "Sin categoría",
          cantidad: parseInt(item.cantidad),
          precio_unitario: parseFloat(item.precio_unitario),
          stock_cantidad: parseInt(item.stock_cantidad) || parseInt(item.cantidad),
        };

        if (
          !cliente.email ||
          !cliente.nombre ||
          !sucursal.nombre ||
          !producto.nombre ||
          !producto.categoria
        ) {
          errores++;
          continue;
        }

        const clienteDB = await prisma.cliente.upsert({
          where: { email: cliente.email },
          update: { nombre: cliente.nombre, telefono: cliente.telefono },
          create: {
            email: cliente.email,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            fecha_registro: cliente.fecha_registro ? new Date(cliente.fecha_registro) : new Date(),
          },
        });

        const sucursalDB = await prisma.sucursal.upsert({
          where: { nombre: sucursal.nombre },
          update: {},
          create: { nombre: sucursal.nombre, ubicacion: "Desconocida" },
        });

        const categoriaDB = await prisma.categoriaProducto.upsert({
          where: { nombre: producto.categoria },
          update: {},
          create: { nombre: producto.categoria },
        });

        let productoDB = await prisma.producto.findFirst({ where: { nombre: producto.nombre } });
        productoDB = productoDB
          ? await prisma.producto.update({
              where: { id_producto: productoDB.id_producto },
              data: { precio: producto.precio_unitario },
            })
          : await prisma.producto.create({
              data: {
                nombre: producto.nombre,
                precio: producto.precio_unitario,
                id_categoria_producto: categoriaDB.id_categoria_producto,
              },
            });

        let stockDB = await prisma.stock.findFirst({
          where: {
            id_sucursal: sucursalDB.id_sucursal,
            id_producto: productoDB.id_producto,
          },
        });

        stockDB = stockDB
          ? await prisma.stock.update({
              where: { id_stock: stockDB.id_stock },
              data: { cantidad: { increment: producto.stock_cantidad } },
            })
          : await prisma.stock.create({
              data: {
                id_sucursal: sucursalDB.id_sucursal,
                id_producto: productoDB.id_producto,
                cantidad: producto.stock_cantidad,
              },
            });

        const movimiento = await prisma.movimientoStock.create({
          data: {
            cantidad: producto.cantidad,
            id_stock: stockDB.id_stock,
          },
        });

        const ventaDB = await prisma.venta.create({
          data: {
            id_cliente: clienteDB.id_cliente,
            id_sucursal: sucursalDB.id_sucursal,
            fecha: venta.fecha ? new Date(venta.fecha) : new Date(),
            total: venta.total,
          },
        });

        await prisma.ventaProducto.create({
          data: {
            id_producto: productoDB.id_producto,
            id_venta: ventaDB.id_venta,
            id_movimiento_stock: movimiento.id_movimiento_stock,
            nombre_producto: producto.nombre,
            cantidad: producto.cantidad,
            precio_unitario: producto.precio_unitario,
          },
        });

        procesados++;
      } catch (error) {
        errores++;
        console.error("❌ Error:", error.message);
      }
    }

    return { procesados, errores, total: datos.length };
  }
}
