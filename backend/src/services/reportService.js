import ExcelJS from "exceljs";
import path from "path";
import fs from "fs/promises";
import { prisma } from "../providers/prisma.js";

export class ReportService {
  constructor() {
    if (ReportService.instance) {
      return ReportService.instance;
    }
    this.reportesGenerados = [];
    ReportService.instance = this;
  }

  async generarReporteDiario(datos, fechaReporte = new Date()) {
    try {
      const nombreArchivo = `reporte_${
        fechaReporte.toISOString().split("T")[0]
      }.xlsx`;
      const rutaArchivo = path.join("./reports", nombreArchivo);

      await this.asegurarDirectorio("./reports");

      const workbook = new ExcelJS.Workbook();

      // Hoja 1: Resumen por Sucursal
      await this.crearHojaResumenSucursal(workbook, datos);

      // Hoja 2: Resumen por Producto
      await this.crearHojaResumenProducto(workbook, datos);

      // Hoja 3: Datos Detallados
      await this.crearHojaDatosDetallados(workbook, datos);

      // Hoja 4: Dashboard
      await this.crearHojaDashboard(workbook, datos);

      await workbook.xlsx.writeFile(rutaArchivo);

      const reporte = await prisma.reporte.create({
        data: {
          fecha_creacion: fechaReporte,
          nombre_archivo: nombreArchivo,
          ruta_archivo: rutaArchivo,
          registros: datos.length,
          peso_archivo: await this.obtenerTamanoArchivo(rutaArchivo),
        }
      })
      

      this.reportesGenerados.push(reporte);

      console.log(`Reporte generado: ${nombreArchivo}`);
      return reporte;
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      throw new Error("Error al generar el reporte");
    }
  }

  async crearHojaResumenSucursal(workbook, datos) {
    const worksheet = workbook.addWorksheet("Resumen por Sucursal");

    worksheet.columns = [
      { header: "Sucursal", key: "sucursal", width: 20 },
      { header: "Total Ventas", key: "totalVentas", width: 15 },
      { header: "Productos Vendidos", key: "productosVendidos", width: 20 },
      { header: "Cantidad Total", key: "cantidadTotal", width: 15 },
      { header: "Ingresos", key: "ingresos", width: 15 },
    ];

    const resumenSucursal = this.agruparPorSucursal(datos);

    resumenSucursal.forEach((item) => {
      worksheet.addRow(item);
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFCCCCCC" },
    };
  }

  async crearHojaResumenProducto(workbook, datos) {
    const worksheet = workbook.addWorksheet("Resumen por Producto");

    worksheet.columns = [
      { header: "Producto", key: "producto", width: 25 },
      { header: "Categoría", key: "categoria", width: 15 },
      { header: "Cantidad Vendida", key: "cantidadVendida", width: 18 },
      { header: "Precio Promedio", key: "precioPromedio", width: 18 },
      { header: "Ingresos Totales", key: "ingresosTotales", width: 18 },
    ];

    const resumenProducto = this.agruparPorProducto(datos);

    resumenProducto.forEach((item) => {
      worksheet.addRow(item);
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFCCCCCC" },
    };
  }

  async crearHojaDatosDetallados(workbook, datos) {
  const worksheet = workbook.addWorksheet("Datos Detallados");

  worksheet.columns = [
    { header: "Fecha", key: "fecha", width: 12 },
    { header: "Sucursal", key: "sucursal", width: 15 },
    { header: "Producto", key: "producto", width: 25 },
     { header: "Descripción", key: "descripcion", width: 30 },
    { header: "Categoría", key: "categoria", width: 15 },
    { header: "Cantidad", key: "cantidad", width: 12 },
    { header: "Precio", key: "precio", width: 12 },
    { header: "Total", key: "total", width: 12 },
    { header: "Cliente", key: "cliente", width: 20 },

   

  ];

  datos.forEach((item) => {
    worksheet.addRow({
      ...item,
      total: item.cantidad * item.precio,
    });
  });
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFCCCCCC" },
  };
}

  async crearHojaDashboard(workbook, datos) {
    const worksheet = workbook.addWorksheet("Dashboard");

    const stats = this.calcularEstadisticas(datos);

    // Título
    worksheet.mergeCells("A1:D1");
    worksheet.getCell("A1").value = "DASHBOARD DE VENTAS";
    worksheet.getCell("A1").font = { size: 16, bold: true };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    // Métricas principales
    let row = 3;
    const metricas = [
      ["Total de Ventas:", `$${stats.ventaTotal.toFixed(2)}`],
      ["Cantidad de Productos:", stats.totalProductos],
      ["Número de Sucursales:", stats.totalSucursales],
      ["Promedio por Venta:", `$${stats.promedioVenta.toFixed(2)}`],
      ["Producto Más Vendido:", stats.productoMasVendido],
      ["Sucursal con Más Ventas:", stats.sucursalMasVentas],
    ];

    metricas.forEach(([label, value]) => {
      worksheet.getCell(`A${row}`).value = label;
      worksheet.getCell(`A${row}`).font = { bold: true };
      worksheet.getCell(`B${row}`).value = value;
      row++;
    });

    worksheet.getColumn("A").width = 25;
    worksheet.getColumn("B").width = 20;
  }

  agruparPorSucursal(datos) {
    const agrupado = datos.reduce((acc, item) => {
      if (!acc[item.sucursal]) {
        acc[item.sucursal] = {
          sucursal: item.sucursal,
          totalVentas: 0,
          productosVendidos: new Set(),
          cantidadTotal: 0,
          ingresos: 0,
        };
      }

      acc[item.sucursal].totalVentas++;
      acc[item.sucursal].productosVendidos.add(item.producto);
      acc[item.sucursal].cantidadTotal += item.cantidad;
      acc[item.sucursal].ingresos += item.cantidad * item.precio;

      return acc;
    }, {});

    return Object.values(agrupado).map((item) => ({
      ...item,
      productosVendidos: item.productosVendidos.size,
      ingresos: `$${item.ingresos.toFixed(2)}`,
    }));
  }

  agruparPorProducto(datos) {
    const agrupado = datos.reduce((acc, item) => {
      if (!acc[item.producto]) {
        acc[item.producto] = {
          producto: item.producto,
          categoria: item.categoria,
          cantidadVendida: 0,
          precios: [],
          ingresosTotales: 0,
        };
      }

      acc[item.producto].cantidadVendida += item.cantidad;
      acc[item.producto].precios.push(item.precio);
      acc[item.producto].ingresosTotales += item.cantidad * item.precio;

      return acc;
    }, {});

    return Object.values(agrupado).map((item) => ({
      producto: item.producto,
      categoria: item.categoria,
      cantidadVendida: item.cantidadVendida,
      precioPromedio: `$${(
        item.precios.reduce((a, b) => a + b, 0) / item.precios.length
      ).toFixed(2)}`,
      ingresosTotales: `$${item.ingresosTotales.toFixed(2)}`,
    }));
  }

  calcularEstadisticas(datos) {
    const ventaTotal = datos.reduce(
      (sum, item) => sum + item.cantidad * item.precio,
      0
    );
    const productos = [...new Set(datos.map((d) => d.producto))];
    const sucursales = [...new Set(datos.map((d) => d.sucursal))];

    // Producto más vendido
    const ventasPorProducto = datos.reduce((acc, item) => {
      acc[item.producto] = (acc[item.producto] || 0) + item.cantidad;
      return acc;
    }, {});

    const productoMasVendido = Object.keys(ventasPorProducto).reduce((a, b) =>
      ventasPorProducto[a] > ventasPorProducto[b] ? a : b
    );

    // Sucursal con más ventas
    const ventasPorSucursal = datos.reduce((acc, item) => {
      acc[item.sucursal] =
        (acc[item.sucursal] || 0) + item.cantidad * item.precio;
      return acc;
    }, {});

    const sucursalMasVentas = Object.keys(ventasPorSucursal).reduce((a, b) =>
      ventasPorSucursal[a] > ventasPorSucursal[b] ? a : b
    );

    return {
      ventaTotal,
      totalProductos: productos.length,
      totalSucursales: sucursales.length,
      promedioVenta: ventaTotal / datos.length,
      productoMasVendido,
      sucursalMasVentas,
    };
  }

  async asegurarDirectorio(ruta) {
    try {
      await fs.access(ruta);
    } catch {
      await fs.mkdir(ruta, { recursive: true });
    }
  }

  async obtenerTamanoArchivo(ruta) {
    try {
      const stats = await fs.stat(ruta);
      return stats.size;
    } catch {
      return 0;
    }
  }

  obtenerReportesGenerados() {
    return this.reportesGenerados;
  }
}
