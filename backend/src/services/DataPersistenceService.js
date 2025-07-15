import { prisma } from "../providers/prisma.js";

export class DataPersistenceService {
  async procesarLote(datos) {
    console.log(`🔄 Iniciando procesamiento de ${datos.length} registros`);
    
    let procesados = 0;
    let errores = 0;

    for (const item of datos) {
      console.log(`📝 Procesando item:`, JSON.stringify(item));
      
      try {
        // Convertir todos los datos relevantes a uppercase para evitar duplicados
        const cliente = {
          email: item.email ? item.email : "",
          nombre: item.nombre ? item.nombre.toUpperCase() : "",
          telefono: item.telefono ? item.telefono : "",
          fecha_registro: item.fecha_registro,
        };

        const sucursal = {
          nombre: item.sucursal ? item.sucursal.toUpperCase() : "",
        };

        const venta = {
          fecha: item.fecha,
          total:
            parseFloat(item.total) ||
            parseFloat(item.precio) * parseInt(item.cantidad),
        };

        const producto = {
          nombre: item.producto ? item.producto.toUpperCase() : "",
          categoria: item.categoria
            ? item.categoria.toUpperCase()
            : "SIN CATEGORÍA",
          cantidad: parseInt(item.cantidad),
          precio_unitario: parseFloat(item.precio),
          stock_cantidad: parseInt(item.stock_cantidad ?? item.cantidad),
        };

        // DEBUG: Mostrar datos transformados
        console.log(`🔍 Datos transformados:`, {
          cliente,
          sucursal,
          venta,
          producto
        });

        // Validación básica
        if (
          !cliente.email ||
          !cliente.nombre ||
          !sucursal.nombre ||
          !producto.nombre ||
          !producto.categoria
        ) {
          console.log(`❌ Validación fallida para registro:`, {
            email: !!cliente.email,
            nombre: !!cliente.nombre,
            sucursal: !!sucursal.nombre,
            producto: !!producto.nombre,
            categoria: !!producto.categoria
          });
          errores++;
          continue;
        }

        console.log(`✅ Validación exitosa, procediendo con persistencia`);

        // Solo busca sucursal existente, no la crea ni modifica
        const sucursalDB = await prisma.sucursal.findFirst({
          where: { nombre: sucursal.nombre },
        });
        
        if (!sucursalDB) {
          console.log(`❌ Sucursal no encontrada: ${sucursal.nombre}`);
          errores++;
          continue; // No procesar si la sucursal no existe
        }

        console.log("🏢 Sucursal encontrada:", sucursalDB.nombre);

        // Persistencia en BD
        const clienteDB = await prisma.cliente.upsert({
          where: { email: cliente.email },
          update: { nombre: cliente.nombre, telefono: cliente.telefono },
          create: {
            email: cliente.email,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            fecha_registro: cliente.fecha_registro
              ? new Date(cliente.fecha_registro)
              : new Date(),
          },
        });

        console.log(`👤 Cliente procesado:`, clienteDB.email);

        const categoriaDB = await prisma.categoriaProducto.upsert({
          where: { nombre: producto.categoria },
          update: {},
          create: { nombre: producto.categoria },
        });

        console.log(`📂 Categoría procesada:`, categoriaDB.nombre);

        let productoDB = await prisma.producto.findFirst({
          where: { nombre: producto.nombre },
        });
        
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

        console.log(`📦 Producto procesado:`, productoDB.nombre);

       
        let stockDB = await prisma.stock.findFirst({
          where: {
            id_sucursal: sucursalDB.id_sucursal,
            id_producto: productoDB.id_producto,
          },
        });

        if (stockDB) {
          // Si existe stock, decrementar la cantidad vendida
          stockDB = await prisma.stock.update({
            where: { id_stock: stockDB.id_stock },
            data: { cantidad: { decrement: producto.cantidad } },
          });
          console.log(`📊 Stock existente actualizado (decrementado ${producto.cantidad}):`, stockDB.cantidad);
        } else {
          // Si no existe stock, crear con cantidad inicial y decrementar la venta
          const cantidadInicial = producto.stock_cantidad || 0;
          const cantidadFinal = Math.max(0, cantidadInicial - producto.cantidad);
          
          stockDB = await prisma.stock.create({
            data: {
              id_sucursal: sucursalDB.id_sucursal,
              id_producto: productoDB.id_producto,
              cantidad: cantidadFinal,
            },
          });
          console.log(`📊 Stock creado - Inicial: ${cantidadInicial}, Vendido: ${producto.cantidad}, Final: ${cantidadFinal}`);
        }

        const movimiento = await prisma.movimientoStock.create({
          data: {
            cantidad: producto.cantidad,
            id_stock: stockDB.id_stock,
            tipo: "salida", // Enum MovimientoStockTipo
          },
        });

        console.log(`📈 Movimiento creado:`, movimiento.id_movimiento_stock);

        const ventaDB = await prisma.venta.create({
          data: {
            id_cliente: clienteDB.id_cliente,
            id_sucursal: sucursalDB.id_sucursal,
            fecha: venta.fecha ? new Date(venta.fecha) : new Date(),
            total: venta.total,
          },
        });

        console.log(`🛒 Venta creada:`, ventaDB.id_venta);

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

        // Log de registro guardado
        console.log("✅ Registro guardado completamente:", {
          cliente: cliente.email,
          sucursal: sucursal.nombre,
          producto: producto.nombre,
          venta: ventaDB.id_venta,
          stock_final: stockDB.cantidad
        });
        
      } catch (error) {
        errores++;
        console.error("❌ Error en procesamiento:", error.message);
        console.error("❌ Stack trace:", error.stack);
      }
    }

    const resultado = { procesados, errores, total: datos.length };
    console.log(`📊 Resultado final:`, resultado);
    return resultado;
  }
}