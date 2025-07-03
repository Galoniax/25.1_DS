import FileAdapter from "./FileAdapter.js";
import fs from "fs";
import xlsx from "xlsx";

export class ExcelAdapter extends FileAdapter {
    constructor() {
        super();
    }

    async convertirFormatoUnificado(filePath) {
        try {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);

            const results = [];

            for (const row of data) {
                const formatoUnificado = this.mapearDatos(row);
                if (this.validarEstructura(formatoUnificado)) {
                    results.push(formatoUnificado);
                }
            }

            console.log(`Excel procesado: ${resultados.length} registros válidos`);
            return results;
        } catch (error) {
            console.error('Error al convertir el Excel:', error);
            throw new Error('Error al convertir el Excel');
        }
    }

    mapearDatos(data) {
        // Implementar la lógica de mapeo según el formato unificado requerido
        return {
            fecha: this.normalizarFecha(data.fecha || data.date || data.Fecha),
            producto: data.producto || data.product || data.Producto,
            cantidad: parseInt(data.cantidad || data.quantity || data.Cantidad) || 0,
            precio: parseFloat(data.precio || data.price || data.Precio) || 0,
            sucursal: data.sucursal || data.branch || data.Sucursal,
            categoria: data.categoria || data.category || data.Categoria || 'Sin categoría',
            descripcion: data.descripcion || data.description || data.Descripcion || ''
        };
    }
    validarEstructura(data) {
        // Validar que los campos requeridos estén presentes
        return data.fecha && data.producto && data.cantidad >= 0 && data.precio >= 0 && data.sucursal;
    }

    normalizarFecha(fecha) {
        if (!fecha) return null;

        if (typeof fecha === 'number') {
            const fechaExcel = new Date((fecha - 25569) * 86400 * 1000);
            return fechaExcel.toISOString().split('T')[0];
        }

        const fechaObj = new Date(fecha);
        return fechaObj.toISOString().split('T')[0];

    }

    }