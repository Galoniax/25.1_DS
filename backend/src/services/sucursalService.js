import { prisma } from "../providers/prisma.js";

export class SucursalService {
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
}
