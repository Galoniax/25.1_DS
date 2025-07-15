import { prisma } from "../providers/prisma.js";

export class ProductoService {
  /* 
    id_producto           Int     @id @default(autoincrement())
    id_categoria_producto Int
    nombre                String
    precio                Float
    descripcion           String?
    activo                Boolean @default(true)

    categoriaProducto CategoriaProducto @relation(fields: [id_categoria_producto], references: [id_categoria_producto])
    stocks            Stock[]
    ventaProductos    VentaProducto[]

    @@index([nombre], name: "idx_producto_nombre")
    @@index([precio], name: "idx_producto_precio")
  */

  static instance;
  constructor() {}

  static getInstance() {
    if (!ProductoService.instance) {
      ProductoService.instance = new ProductoService();
    }
    return ProductoService.instance;
  }

  async getAllProductos() {
    try {
      return await prisma.producto.findMany({
        include: {
          categoriaProducto: true,
        },
      });
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      throw new Error("Error obteniendo productos");
    }
  }

  async getProductoById(id) {
    try {
      return await prisma.producto.findUnique({
        where: { id_producto: Number(id) },
        include: {
          categoriaProducto: true,
          ventaProductos: true,
          stocks: true,
        },
      });
    } catch (error) {
      console.error("Error obteniendo producto por ID:", error);
      throw new Error("Error obteniendo producto por ID");
    }
  }

  async createProducto({ id_categoria_producto, nombre, precio, descripcion }) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Verificar si la categoría existe
        const categoria = await tx.categoriaProducto.findUnique({
          where: { id_categoria_producto: Number(id_categoria_producto) },
        });
        if (!categoria) {
          throw new Error("La categoría no existe");
        }
        // Verificar si el producto ya existe
        const productoExistente = await tx.producto.findUnique({
          where: { nombre: nombre.toUpperCase() },
        });
        if (productoExistente) {
          throw new Error("El producto ya existe");
        }
        // Crear el producto
        const data = {
          id_categoria_producto: Number(id_categoria_producto),
          nombre: nombre.toUpperCase(),
          precio: parseFloat(precio),
          descripcion: descripcion ? descripcion : null,
        };
        return await tx.producto.create({ data });
      });

      return result;
    } catch (error) {
      console.error("Error creando producto:", error);
      throw new Error("Error creando producto");
    }
  }

  async updateProducto({ id, nombre, precio, descripcion }) {
    try {
      const data = {
        id_categoria_producto: Number(id_categoria_producto),
        nombre: nombre.toUpperCase(),
        precio: parseFloat(precio),
        descripcion: descripcion ? descripcion : null,
      };

      return await prisma.producto.update({
        where: { id_producto: Number(id) },
        data,
      });
    } catch (error) {
      console.error("Error actualizando producto:", error);
      throw new Error("Error actualizando producto");
    }
  }

  async deleteProducto(id) {
    try {
      // Primero busca el producto y sus stocks asociados
      const producto = await prisma.producto.findUnique({
        where: { id_producto: Number(id) },
        include: { stocks: true },
      });

      if (!producto) {
        throw new Error("Producto no encontrado");
      }

      if (producto.stocks.length > 0) {
        throw new Error(
          "No se puede eliminar el producto porque tiene stocks asociados"
        );
      }

      // Si no tiene stocks asociados, lo elimina
      return await prisma.producto.delete({
        where: { id_producto: Number(id) },
      });
    } catch (error) {
      console.error("Error eliminando producto:", error);
      throw new Error(error.message || "Error eliminando producto");
    }
  }
}
