import FileAdapter from "./FileAdapter.js";
import fs from "fs";
import csv from "csv-parser";

export class CSVAdapter extends FileAdapter {
  constructor() {
    super();
  }

  async convertirFormatoUnificado(filePath) {
    const results = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          console.log("Procesando fila CSV:", row);

          const formatoUnificado = this.mapearDatos(row);
          const esValida = this.validarEstructura(formatoUnificado);

          if (esValida) {
            results.push(formatoUnificado);
          } else {
            console.warn("❌ Fila inválida descartada:", JSON.stringify(row));
          }
        })
        .on("end", () => {
          console.log(`✅ CSV procesado: ${results.length} registros válidos`);
          resolve(results);
        })
        .on("error", (error) => {
          console.error("❌ Error al leer CSV:", error);
          reject(error);
        });
    });
  }

  mapearDatos(data) {
    return {
      cliente: {
        email: data.cliente_email?.trim(),
        nombre: data.cliente_nombre?.trim(),
        telefono: data.cliente_telefono?.trim() || "", // Por si se agrega luego
        fecha_registro: this.normalizarFecha(data.fecha) || this.hoy(),
      },
      sucursal: {
        id: data.id_sucursal?.trim(),
        nombre: data.nombre_sucursal?.trim(),
      },
      venta: {
        fecha: this.normalizarFecha(data.fecha),
        total: parseFloat(data.total_venta?.replace(",", ".")) || 0,
      },
      producto: {
        nombre: data.nombre_producto?.trim(),
        categoria: data.categoria_producto?.trim() || "Sin categoría",
        cantidad: parseInt(data.cantidad) || 0,
        precio_unitario: parseFloat(data.precio_unitario?.replace(",", ".")) || 0,
        stock_cantidad: parseInt(data.stock_cantidad) || parseInt(data.cantidad) || 0,
      },
    };
  }

  validarEstructura(data) {
    const esValido =
      data?.cliente?.email &&
      data?.cliente?.nombre &&
      data?.sucursal?.nombre &&
      data?.venta?.fecha &&
      data?.producto?.nombre &&
      data?.producto?.categoria &&
      data?.producto?.cantidad >= 0 &&
      data?.producto?.precio_unitario >= 0;

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
