import { prisma } from "../providers/prisma.js";

export class ClienteService {
  /*
    id_cliente     Int      @id @default(autoincrement())
    nombre         String
    email          String   @unique
    telefono       String
    fecha_registro DateTime
    ventas         Venta[]

    @@index([email], name: "idx_cliente_email")
*/

  static instance;

  static getInstance() {
    if (!ClienteService.instance) {
      ClienteService.instance = new ClienteService();
    }
    return ClienteService.instance;
  }

  async getAllClientes() {
    try {
      return await prisma.cliente.findMany();
    } catch (error) {
      console.error("Error obteniendo clientes:", error);
      throw new Error("Error obteniendo clientes");
    }
  }

  async getClienteById(id) {
    try {
      return await prisma.cliente.findUnique({
        where: { id_cliente: Number(id) },
      });
    } catch (error) {
      console.error("Error obteniendo cliente por ID:", error);
      throw new Error("Error obteniendo cliente por ID");
    }
  }

  async createCliente({ nombre, email, telefono }) {
    try {
      const data = {
        nombre: nombre.toUpperCase(),
        email: email.toLowerCase(),
        telefono: telefono ? telefono : null,
        fecha_registro: new Date(),
      };

      return await prisma.cliente.upsert({
        where: { email: data.email },
        update: { nombre: data.nombre, telefono: data.telefono },
        create: data,
      });
    } catch (error) {
      console.error("Error creando cliente:", error);
      throw new Error("Error creando cliente");
    }
  }

  async updateCliente({ id, nombre, email, telefono }) {
    try {
      const data = {
        nombre: nombre.toUpperCase(),
        email: email.toLowerCase(),
        telefono: telefono ? telefono : null,
      };

      return await prisma.cliente.update({
        where: { id_cliente: Number(id) },
        data,
      });
    } catch (error) {
      console.error("Error actualizando cliente:", error);
      throw new Error("Error actualizando cliente");
    }
  }

  async deleteCliente(id) {
    try {
      const ventas = await prisma.venta.findMany({
        where: { id_cliente: Number(id) },
        select: { id_venta: true },
      });
      if (ventas.length > 0) {
        throw new Error(
          "No se puede eliminar el cliente porque tiene ventas asociadas."
        );
      }
      return await prisma.cliente.delete({
        where: { id_cliente: Number(id) },
      });
    } catch (error) {
      console.error("Error eliminando cliente:", error);
      throw new Error(error.message || "Error eliminando cliente");
    }
  }

  async getClientesWithVentas() {
    try {
      return await prisma.cliente.findMany({
        include: {
          ventas: true,
        },
      });
    } catch (error) {
      console.error("Error obteniendo clientes con ventas:", error);
      throw new Error("Error obteniendo clientes con ventas");
    }
  }
}
