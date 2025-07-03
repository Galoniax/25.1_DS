import { Router } from 'express';
import { CategoriaController } from '../controllers/categoriaController.js';

const router = Router();
const categoriaController = new CategoriaController();

// Obtener todas las categorías
router.get('/', categoriaController.getAllCategorias.bind(categoriaController));

// Obtener una categoría por su ID
router.get('/:id', categoriaController.getCategoriaById.bind(categoriaController));

// Crear una nueva categoría
router.post('/create', categoriaController.createCategoria.bind(categoriaController));

// Actualizar una categoría
router.put('/update/:id', categoriaController.updateCategoria.bind(categoriaController));

// Eliminar una categoría
router.delete('/delete/:id', categoriaController.deleteCategoria.bind(categoriaController));

export { router as categoriaRouter };