import { Router } from 'express';
import { VentaController } from '../controllers/ventaController.js';

const router = Router();
const ventaController = new VentaController();


router.get('/', (req, res) => ventaController.getAllVentas(req, res));
router.get('/:id', (req, res) => ventaController.getVentasById(req, res));
router.get('/sucursal/:id_sucursal', (req, res) => ventaController.getVentasBySucursal(req, res));

export { router as ventaRouter };
