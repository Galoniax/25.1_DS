import { Router } from 'express';
import { SucursalController } from '../controllers/sucursalController.js';

const router = Router();
const sucursalController = new SucursalController();

// Obtener todas las sucursales
router.get('/', sucursalController.getAllSucursales.bind(sucursalController));

// Crear una nueva sucursal
router.post('/create', sucursalController.createSucursal.bind(sucursalController));

// Actualizar una sucursal
router.put('/update/:id', sucursalController.updateSucursal.bind(sucursalController));

// Eliminar una sucursal
router.delete('/delete/:id', sucursalController.deleteSucursal.bind(sucursalController));

// Obtener una sucursal por su ID
router.get('/:id', sucursalController.getSucursalById.bind(sucursalController));

export { router as sucursalRouter };