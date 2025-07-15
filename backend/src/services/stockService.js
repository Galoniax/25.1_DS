import { prisma } from "../providers/prisma.js";

export class StockService {
  /**
    model Stock {
    id_stock    Int @id @default(autoincrement())
    id_sucursal Int
    id_producto Int
    cantidad    Int

    sucursal    Sucursal          @relation(fields: [id_sucursal], references: [id_sucursal])
    producto    Producto          @relation(fields: [id_producto], references: [id_producto])
    movimientos MovimientoStock[]

    @@index([id_sucursal], name: "idx_stock_id_sucursal")
    @@index([id_producto], name: "idx_stock_id_producto")
*/
  static instance;
  constructor() {}

  static getInstance() {
    if (!StockService.instance) {
      StockService.instance = new StockService();
    }
    return StockService.instance;
  }
  async getAllStocks() {
    try {
      return await prisma.stock.findMany();
    } catch (error) {
      console.error("Error obteniendo stocks:", error);
      throw new Error("Error obteniendo stocks");
    }
  }

  async getStockById(id) {
    try {
      return await prisma.stock.findUnique({
        where: { id_stock: Number(id) },
        include: {
          producto: true,
          movimientosStock: true,
        },
      });
    } catch (error) {
      console.error("Error obteniendo stock por ID:", error);
      throw new Error("Error obteniendo stock por ID");
    }
  }

  async createStock({ id_producto, id_sucursal, cantidad }) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Verificar si el producto existe
        const producto = await tx.producto.findUnique({
          where: { id_producto: Number(id_producto) },
        });
        if (!producto) {
          throw new Error("El producto no existe");
        }

        // Busca stock existente por producto y sucursal
        let stock = await tx.stock.findFirst({
          where: {
            id_producto: Number(id_producto),
            id_sucursal: Number(id_sucursal),
          },
        });

        if (stock) {
          // Actualizar stock existente
          stock = await tx.stock.update({
            where: { id_stock: stock.id_stock },
            data: { cantidad: stock.cantidad + Number(cantidad) },
          });
        } else {
          // Crear nuevo stock
          stock = await tx.stock.create({
            data: {
              id_producto: Number(id_producto),
              id_sucursal: Number(id_sucursal),
              cantidad: Number(cantidad),
            },
          });
        }

        // Registrar el movimiento de entrada
        await tx.movimientoStock.create({
          data: {
            cantidad: Number(cantidad),
            id_stock: stock.id_stock,
            tipo: "entrada", // Enum MovimientoStockTipo
          },
        });

        return stock;
      });
    } catch (error) {
      console.error("Error creando stock:", error);
      throw new Error("Error creando stock");
    }
  }

  async getStockBySucursal(id_sucursal) {
    try {
      return await prisma.stock.findMany({
        where: { id_sucursal: Number(id_sucursal) },
        include: {
          producto: true,
          movimientosStock: true,
        },
      });
    } catch (error) {
      console.error("Error obteniendo stock por ID:", error);
      throw new Error("Error obteniendo stock por ID");
    }
  }

  async updateStock({ id, cantidad }) {
    try {
      return await prisma.$transaction(async (tx) => {
        const stock = await tx.stock.update({
          where: { id_stock: Number(id) },
          data: { cantidad: Number(cantidad) },
        });

        if (!stock) {
          throw new Error("Stock no encontrado");
        }

        // Registrar un nuevo movimiento de entrada (cada movimiento debe ser un registro nuevo)
        await tx.movimientoStock.create({
          data: {
            cantidad: Number(cantidad),
            id_stock: stock.id_stock,
            tipo: "entrada", // Enum MovimientoStockTipo
          },
        });

        return stock;
      });
    } catch (error) {
      console.error("Error actualizando stock:", error);
      throw new Error("Error actualizando stock");
    }
  }

  async deleteStock(id) {
    try {
      const stock = await prisma.stock.findUnique({
        where: { id_stock: Number(id) },
        include: {
          movimientosStock: true,
        },
      });

      if (!stock) {
        throw new Error("Stock no encontrado");
      }

      // Eliminar stock
      if (stock.movimientosStock.length > 0) {
        throw new Error(
          "No se puede eliminar el stock porque tiene movimientos asociados"
        );
      }
      return await prisma.stock.delete({
        where: { id_stock: Number(id) },
      });
    } catch (error) {
      console.error("Error eliminando stock:", error);
      throw new Error("Error eliminando stock");
    }
  }
}
