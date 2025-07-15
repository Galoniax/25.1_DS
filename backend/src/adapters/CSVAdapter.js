import FileAdapter from "./FileAdapter.js";
import fs from "fs";
import csv from "csv-parser";

export class CSVAdapter extends FileAdapter {
  constructor(configuracion) {
    super();
    this.configuracion = configuracion; // El mapeo dinámico
  }

  async convertirFormatoUnificado(filePath) {
    const results = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          // Mapea usando la configuración
          const formatoUnificado = this.mapearDatos(row, this.configuracion);
          const esValida = this.validarEstructura(formatoUnificado);

          if (esValida) {
            results.push(formatoUnificado);
          }
        })
        .on("end", () => resolve(results))
        .on("error", (error) => reject(error));
    });
  }

  mapearDatos(data, configuracion) {
    // Si no hay configuración, retorna el objeto tal cual
    if (!configuracion) return data;

    console.log("➡️ Datos originales recibidos:", JSON.stringify(data));
    console.log("🗺️ Configuración de mapeo:", JSON.stringify(configuracion));

    const mapeado = {};
    for (const [columnaArchivo, nombreInterno] of Object.entries(
      configuracion
    )) {
      let valor = data[columnaArchivo];
      // Convierte a uppercase si es string y no es null/undefined
      if (typeof valor === "string") {
        if (nombreInterno === "email") {
          valor = valor; 
        } else {
          valor = valor.toUpperCase();
        }
      }
      mapeado[nombreInterno] = valor;
    }
    return mapeado;
  }

  validarEstructura(data) {
    const esValido =
      data?.email &&
      data?.nombre &&
      data?.sucursal &&
      data?.fecha &&
      data?.producto &&
      data?.categoria &&
      data?.cantidad !== undefined &&
      data?.precio !== undefined;

    if (!esValido) {
      console.log("⚠️ Datos incompletos:", JSON.stringify(data, null, 2));
    }

    return esValido;
  }

  normalizarFecha(fecha) {
    if (!fecha) return null;

    const fechaStr = fecha.toString().trim();

    // Si ya está en formato válido
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) return fechaStr;

    // Parse manual de DD/MM/YYYY o DD-MM-YYYY
    const match = fechaStr.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
    if (match) {
      const [, dd, mm, yyyy] = match;
      return `${yyyy}-${mm}-${dd}`;
    }

    // Último recurso
    const date = new Date(fechaStr);
    return isNaN(date) ? null : date.toISOString().split("T")[0];
  }

  hoy() {
    return new Date().toISOString().split("T")[0];
  }
}
