import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login.bind(authController));

router.post('/register', authController.register.bind(authController));

export { router as authRouter };
