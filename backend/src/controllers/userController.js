import { UserService } from "../services/userService.js";
import { hashPassword } from "../utils/hash.js";

export class UserController {
    constructor() {
        this.userService = UserService.getInstance();
    }

    async getAllUsers(req, res) {
        try {
            const users = await this.userService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getUserById(req, res) {
        const { id } = req.params;
        try {
            const user = await this.userService.getById(id);
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado." });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createUser(req, res) {
        try {
            const user = req.body;

            const existingUser = await this.userService.getByEmail(user.email);

            if (existingUser) {
                return res.status(409).json({ message: "Email ya registrado" });
            }

            const hashedPassword = await hashPassword(user.password);

            user.password = hashedPassword;

            const createdUser = await this.userService.createWithRole({ user });
            res.status(201).json(createdUser);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateUser(req, res) {
        try {
            const { id } = req.params;

            const user = await this.userService.getById(id);

            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado." });
            }

            const { username, email, role } = req.body;

            user.username = username || user.username;
            user.email = email || user.email;
            user.role = role || user.role;

            const updatedUser = await this.userService.update({ id, user });
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteUser(req, res) {
        const { id } = req.params;
        try {
            await this.userService.delete({ id });
            res.status(200).json({ message: "Usuario eliminado." });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}