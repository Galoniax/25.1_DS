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
      });
      return res.status(200).json({ token });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async register(req, res) {
    const { email, password, role, id_sucursal } = req.body;

    try {
      const user = await this.userService.getByEmail(email);

      if (user) {
        return res.status(409).json({ message: "El email ya está registrado" });
      }
      if (!email || !password || !role) {
        return res.status(400).json({ message: "Faltan datos requeridos" });
      }

      if (role !== "marketing" && role !== "sucursal") {
        return res.status(400).json({ message: "Rol no permitido" });
      }

      
    if (role === "sucursal" && !id_sucursal) {
      return res.status(400).json({ message: "Falta id_sucursal para el rol 'sucursal'" });
    }

      const hashedPassword = await hashPassword(password);
      const newUser = await this.userService.create({
        email,
        password: hashedPassword,
        role,
        ...(role === "sucursal" && { id_sucursal }),
      });

      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}
