import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { validarConZod } from '../middleware/validacionZod.js';
import { UserSchema } from '../schema/user.schema.js';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login.bind(authController));

router.post('/register', 
    validarConZod(UserSchema),
    authController.register.bind(authController));

export { router as authRouter };
