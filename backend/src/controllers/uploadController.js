import multer from "multer";
import path from "path";

import { DataProcessorService } from "../services/DataProcessorService.js";
import { AdapterFactory } from "../adapters/AdapterFactory.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
    const allowedTypes = ['.csv', '.xlsx', '.xls', '.json'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  }
});

export class UploadController {
  constructor() {
    const adapterFactory = new AdapterFactory();
    this.dataProcessor = new DataProcessorService(adapterFactory);
  }

  async subirArchivo(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      const adapterFactory = new AdapterFactory();
      const tipoArchivo = adapterFactory.obtenerTipoArchivo(req.file.originalname);
      
      console.log(`Procesando archivo: ${req.file.originalname}`);
      
      const resultado = await this.dataProcessor.procesarArchivo(req.file.path, tipoArchivo);
      
      res.json({
        success: true,
        message: 'Archivo procesado exitosamente',
        data: {
          archivo: req.file.originalname,
          ...resultado
        }
      });

    } catch (error) {
      console.error('Error en upload:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando archivo',
        error: error.message
      });
    }
  }

  async obtenerEstadisticas(req, res) {
    try {
      const stats = this.dataProcessor.obtenerEstadisticas();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: error.message
      });
    }
  }

  async limpiarDatos(req, res) {
    try {
      this.dataProcessor.limpiarDatos();
      
      res.json({
        success: true,
        message: 'Datos limpiados exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error limpiando datos',
        error: error.message
      });
    }
  }

  getUploadMiddleware() {
    return upload.single('archivo');
  }
}