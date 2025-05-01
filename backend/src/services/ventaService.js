import { prisma } from "../providers/prisma.js";

export class VentaService {
    static instance;

    constructor() {}

    static getInstance() {
        if (!VentaService.instance) {
            VentaService.instance = new VentaService();
        }
        return VentaService.instance;
    }

    async getAllVentas() {
        try {
            return await prisma.venta.findMany();
        } catch (error) {
            console.error("Error fetching ventas:", error);
            throw new Error("Error fetching ventas");
        }
    }

    async getVentasById({ id }) {
        try {
            return await prisma.venta.findUnique({ 
              where: { id_venta: Number(id) },
              include: {
                  productos: {
                    include: {
                      producto: true,
                    },
                  },
                  sucursal: true,
                },
            });
        } catch (error) {
            console.error("Error fetching ventas:", error);
            throw new Error("Error fetching ventas");
        }
    }

    async getVentasBySucursal({ id }) {
        try {
            return await prisma.venta.findMany({
                where: { id_sucursal: Number(id) },
                include: {
                  productos: {
                    include: {
                      producto: true,
                    },
                  },
                },
              });
        } catch (error) {
            console.error("Error fetching ventas:", error);
            throw new Error("Error fetching ventas");
        }
    }

}