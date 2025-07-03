import { Router } from 'express';
import { UploadController } from '../controllers/uploadController.js';

import { verificarToken, verificarRol } from '../middleware/auth.js';

const router = Router();
const uploadController = new UploadController();


router.post('/', 
  verificarToken,
  verificarRol(['sucursal']),
  uploadController.getUploadMiddleware(),
  uploadController.subirArchivo.bind(uploadController)
);


router.get('/stats',
  verificarToken,
  uploadController.obtenerEstadisticas.bind(uploadController)
);


router.delete('/clear',
  verificarToken,
  verificarRol(['marketing']),
  uploadController.limpiarDatos.bind(uploadController)
);


export { router as uploadRouter };