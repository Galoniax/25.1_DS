import { Router } from 'express';
import { VentaController } from '../controllers/ventaController.js';

const router = Router();
const ventaController = new VentaController();

router.get("/sucursal/:id_sucursal", ventaController.getVentasBySucursal);
router.get("/detalle/:id", ventaController.getVentasById);  
router.get("/", ventaController.getAllVentas);

export { router as ventaRouter };
