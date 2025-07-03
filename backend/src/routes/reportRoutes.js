import { Router } from 'express';
import { ReportController } from '../controllers/ReportController.js';

import { verificarToken, verificarRol } from '../middleware/auth.js';

const router = Router();
const reportController = new ReportController();

router.post('/generate',
  verificarToken,
  verificarRol(['marketing']),
  reportController.generarReporte.bind(reportController)
);

router.get('/',
  verificarToken,
  verificarRol(['marketing']),
  reportController.listarReportes.bind(reportController)
);

router.get('/download/:id',
  verificarToken,
  verificarRol(['marketing']),
  reportController.descargarReporte.bind(reportController)
);

export { router as reportRouter };
