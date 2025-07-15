import cron from "node-cron";
import fs from "fs";
import path from "path";
import { DataProcessorService } from "../services/DataProcessorService.js";
import { ReportService } from "../services/reportService.js";
import { UploadController } from "../controllers/uploadController.js";

export class DailyScheduler {
  constructor() {
    this.dataProcessor = new DataProcessorService();
    this.reportService = new ReportService();
    this.uploadController = new UploadController();
    this.isRunning = false;
  }

  iniciar() {
    cron.schedule(
      "0 23 * * *",
      async () => {
        await this.ejecutarProcesoDiario();
      },
      {
        timezone: "America/Argentina/Buenos_Aires",
      }
    );

    // También permitir ejecución manual para testing
    cron.schedule("*/30 * * * *", async () => {
      await this.verificarDatosNuevos();
    });

    console.log(
      "Scheduler diario iniciado - Ejecutará a las 23:00 todos los días"
    );
  }

  async ejecutarProcesoDiario() {
    if (this.isRunning) {
      console.log("Proceso diario ya está ejecutándose...");
      return;
    }

    this.isRunning = true;
    console.log("Iniciando proceso diario automatizado...");

    try {
      // 1. Procesar todos los archivos CSV de uploads/
      const uploadDir = path.resolve("uploads");
      const archiveDir = path.resolve("archive");
      const files = fs
        .readdirSync(uploadDir)
        .filter((f) =>
          [".csv", ".xlsx", ".xls"].some((ext) => f.toLowerCase().endsWith(ext))
        );

      for (const f of files) {
        const fp = path.join(uploadDir, f);
        try {
          // Detecta tipo de archivo dinámicamente
          const tipoArchivo =
            this.dataProcessor.adapterFactory.obtenerTipoArchivo(f);

          const match = f.match(/^sucursal(\d+)_/);
          const idSucursal = match ? parseInt(match[1]) : null;
          if (!idSucursal) {
            console.error(
              `No se pudo determinar la sucursal para el archivo ${f}`
            );
            continue;
          }
          await this.dataProcessor.procesarArchivo(fp, tipoArchivo, idSucursal);
          fs.renameSync(fp, path.join(archiveDir, f));
        } catch (e) {
          console.error("Error procesando archivo:", f, e);
        }
      }

      // 2. Obtener todos los datos unificados
      const datos = this.dataProcessor.obtenerDatosUnificados();

      if (datos.length === 0) {
        console.log("No hay datos para procesar en el reporte diario");
        return;
      }

      // 3. Generar reporte diario
      const reporte = await this.reportService.generarReporteDiario(datos);
      console.log(`Reporte diario generado: ${reporte.nombre}`);

      // 4. Limpiar datos procesados para el siguiente día
      this.dataProcessor.limpiarDatos();
      console.log("Datos limpiados para el siguiente día");

      // 5. Enviar notificación (simulado)
      await this.enviarNotificacion(reporte);
    } catch (error) {
      console.error("Error en proceso diario:", error);
    } finally {
      this.isRunning = false;
    }
  }

  async verificarDatosNuevos() {
    const stats = this.dataProcessor.obtenerEstadisticas();
    if (stats.totalRegistros > 0) {
      console.log(
        `Datos disponibles para procesamiento: ${stats.totalRegistros} registros`
      );
    }
  }

  async enviarNotificacion(reporte) {
    // Simular envío de notificación
    console.log(`📧 Notificación: Reporte diario generado - ${reporte.nombre}`);
    console.log(`📊 Registros procesados: ${reporte.registros}`);
    console.log(`📁 Archivo disponible en: ${reporte.ruta}`);
  }

  async ejecutarManual() {
    console.log("Ejecutando proceso manual...");
    await this.ejecutarProcesoDiario();
  }

  detener() {
    cron.destroy();
    console.log("Scheduler detenido");
  }
}
