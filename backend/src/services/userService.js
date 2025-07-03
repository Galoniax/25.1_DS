import { prisma } from "../providers/prisma.js";

export class UserService {
/*
    id_user     Int    @id @default(autoincrement())
    email       String @unique
    password    String
    role        Role
    id_sucursal Int?
*/

  static instance;

  constructor() {}

  static getInstance() {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getAllUsers() {
    try {
      return await prisma.user.findMany({
        select: {
          id_user: true,
          email: true,
          role: true,
          id_sucursal: true,
        },
      });
    } catch (error) {
      throw new Error("No se pudo obtener los usuarios.");
    }
  }

  async getByEmail(email) {
    try {
      return await prisma.user.findUnique({
        where: { email: email },
        select: {
          id_user: true,
          email: true,
          password: true,
          role: true,
          id_sucursal: true,
        },
      });
    } catch (error) {
      throw new Error("No se pudo obtener el usuario.");
    }
  }

  async getById(id) {
    try {
      return await prisma.user.findUnique({
        where: { id_user: Number(id) },
        select: {
          id_user: true,
          email: true,
          role: true,
          id_sucursal: true,
        },
      });
    } catch (error) {
      throw new Error("No se pudo obtener el usuario.");
    }
  }

  async create({ email, password, role, id_sucursal }) {
    try {
      const data = {
        email: email,
        password: password,
        role: role,
      };

      if (role === "sucursal") {
        data.id_sucursal = id_sucursal;
      }

      return await prisma.user.create({ data });
    } catch (error) {
      throw new Error("No se pudo crear el usuario.");
    }
  }

  async update({ id, user }) {
    try {
      return await prisma.user.update({
        where: {
          id_user: Number(id),
        },
        data: user,
      });
    } catch (error) {
      throw new Error("No se pudo actualizar el usuario.");
    }
  }

  async delete(id) {
    try {
      return await prisma.user.delete({
        where: { id_user: Number(id) },
      });
    } catch (error) {
      throw new Error("No se pudo eliminar el usuario.");
    }
  }
}
