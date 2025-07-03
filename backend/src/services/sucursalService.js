import { prisma } from "../providers/prisma.js";

export class SucursalService {

  /*
  id_sucursal Int    @id @default(autoincrement())
  nombre      String
  ubicacion   String

  fuenteDatos FuenteDatos[]
  stocks      Stock[]
  ventas      Venta[]
  reportes    Reporte[]
  users       User[]
  */

  static instance;

  constructor() {}

  static getInstance() {
    if (!SucursalService.instance) {
      SucursalService.instance = new SucursalService();
    }
    return SucursalService.instance;
  }

  async getAllSucursales() {
    try {
      return await prisma.sucursal.findMany();
    } catch (error) {
      console.error("Error fetching sucursales:", error);
      throw new Error("Error fetching sucursales");
    }
  }

  async getSucursalById(id) {
    try {
      return await prisma.sucursal.findUnique({
        where: { id_sucursal: Number(id) },
      });
    } catch (error) {
      console.error("Error fetching sucursal by ID:", error);
      throw new Error("Error fetching sucursal by ID");
    }
  }

  async createSucursal({ nombre, ubicacion }) {
    try {
      const data = {
        nombre: nombre,
        ubicacion: ubicacion,
      };

      return await prisma.sucursal.create({ data });
    } catch (error) {
      console.error("Error creating sucursal:", error);
      throw new Error("Error creating sucursal");
    }
  }

  async updateSucursal({ id, sucursal }) {
    try {
      return await prisma.sucursal.update({
        where: {
          id_sucursal: Number(id),
        },
        data: sucursal,
      });
    } catch (error) {
      console.error("Error updating sucursal:", error);
      throw new Error("Error updating sucursal");
    }
  }

  async deleteSucursal(id) {
    try {
      return await prisma.sucursal.delete({
        where: { id_sucursal: Number(id) },
      });
    } catch (error) {
      console.error("Error deleting sucursal:", error);
      throw new Error("Error deleting sucursal");
    }
  }

}
