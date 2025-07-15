import { UserService } from "../services/userService.js";
import { comparePassword } from "../utils/hash.js";
import { hashPassword } from "../utils/hash.js";
import { createToken, verifyToken } from "../utils/jwt.js";

export class AuthController {
  constructor() {
    this.userService = UserService.getInstance();
  }

  async login(req, res) {
    const { email, password } = req.body;

    try {
      const user = await this.userService.getByEmail(email);

      if (!user) {
        return res.status(401).json({ message: "El email no está registrado" });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      const token = createToken({
        id_user: user.id_user,
        email: user.email,
        role: user.role,
        id_sucursal: user.id_sucursal || null,
      });
      return res.status(200).json({ token });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async register(req, res) {
    const { email, password, role, id_sucursal } = req.body;

    try {
      const existingUser = await this.userService.getByEmail(email);

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "El email ya está registrado",
        });
      }

      const hashedPassword = await hashPassword(password);

      const userData = {
        email,
        password: hashedPassword,
        role,
      };

      if (id_sucursal) {
        userData.id_sucursal = id_sucursal;
      }

      const newUser = await this.userService.create(userData);

      return res.status(201).json({
        success: true,
        data: newUser,
      });
    } catch (error) {
      console.error("Error en register:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
}
