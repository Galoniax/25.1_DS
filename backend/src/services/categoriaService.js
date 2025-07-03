import { prisma } from "../providers/prisma.js";

export class CategoriaService {
  /*
    id_categoria_producto Int        @id @default(autoincrement())
    nombre                String
    productos             Producto[]
  */

  static instance;
  constructor() {}

  static getInstance() {
    if (!CategoriaService.instance) {
      CategoriaService.instance = new CategoriaService();
    }
    return CategoriaService.instance;
  }

  async getAllCategorias() {
    try {
      return await prisma.categoriaProducto.findMany();
    } catch (error) {
      console.error("Error fetching categorias:", error);
      throw new Error("Error fetching categorias");
    }
  }

  async getCategoriaById(id) {
    try {
      return await prisma.categoriaProducto.findUnique({
        where: { id_categoria_producto: Number(id) },
        include: {
          productos: true,
        },
      });
    } catch (error) {
      console.error("Error fetching categoria by ID:", error);
      throw new Error("Error fetching categoria by ID");
    }
  }

  async create({ nombre }) {
    try {
      const data = {
        nombre: nombre,
      };

      return await prisma.categoriaProducto.create({ data });
    } catch (error) {
      console.error("Error creating categoria:", error);
      throw new Error("Error creating categoria");
    }
  }
  async update({ id, nombre }) {
    try {
      const data = {
        nombre: nombre,
      };

      return await prisma.categoriaProducto.update({
        where: { id_categoria_producto: Number(id) },
        data,
      });
    } catch (error) {
      console.error("Error updating categoria:", error);
      throw new Error("Error updating categoria");
    }
  }

  async delete(id) {
    try {
      return await prisma.categoriaProducto.delete({
        where: { id_categoria_producto: Number(id) },
      });
    } catch (error) {
      console.error("Error deleting categoria:", error);
      throw new Error("Error deleting categoria");
    }
  }
}
