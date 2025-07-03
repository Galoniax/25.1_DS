import { Router } from 'express';
import { UserController } from '../controllers/userController.js';

const router = Router();
const userController = new UserController();


router.get("/", userController.getAllUsers.bind(userController));
router.get("/:id", userController.getUserById.bind(userController)); 
router.post("/create", userController.createUser.bind(userController)); 
router.put("/update/:id", userController.updateUser.bind(userController));
router.delete("/delete/:id", userController.deleteUser.bind(userController));

export { router as userRouter };
