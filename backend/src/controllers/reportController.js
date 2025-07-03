import { ReportService } from "../services/reportService.js";
import { DataProcessorService } from "../services/DataProcessorService.js";
import path from "path";
import fs from "fs";

export class ReportController {
  constructor() {
    this.reportService = new ReportService();
    this.dataProcessor = new DataProcessorService();
  }

  async generarReporte(req, res) {
    try {
      const datos = this.dataProcessor.obtenerDatosUnificados();

      if (datos.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No hay datos para generar el reporte",
        });
      }

      const fechaReporte = req.body.fecha
        ? new Date(req.body.fecha)
        : new Date();
      const reporteInfo = await this.reportService.generarReporteDiario(
        datos,
        fechaReporte
      );

      res.json({
        success: true,
        message: "Reporte generado exitosamente",
        data: reporteInfo,
      });
    } catch (error) {
      console.error("Error generando reporte:", error);
      res.status(500).json({
        success: false,
        message: "Error generando reporte",
        error: error.message,
      });
    }
  }

  async listarReportes(req, res) {
    try {
      const reportes = this.reportService.obtenerReportesGenerados();

      res.json({
        success: true,
        data: reportes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error listando reportes",
        error: error.message,
      });
    }
  }

  async descargarReporte(req, res) {
    try {
      const { id } = req.params;
      const reportes = this.reportService.obtenerReportesGenerados();
      const reporte = reportes.find((r) => r.id == id);

      if (!reporte) {
        return res.status(404).json({
          success: false,
          message: "Reporte no encontrado",
        });
      }

      if (!fs.existsSync(reporte.ruta)) {
        return res.status(404).json({
          success: false,
          message: "Archivo de reporte no encontrado",
        });
      }

      res.download(reporte.ruta, reporte.nombre, (error) => {
        if (error) {
          console.error("Error descargando archivo:", error);
          res.status(500).json({
            success: false,
            message: "Error descargando archivo",
          });
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error descargando reporte",
        error: error.message,
      });
    }
  }
}
