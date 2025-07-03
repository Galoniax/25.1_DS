import { DataPersistenceService } from "./DataPersistenceService.js";

export class DataProcessorService {
  constructor(adapterFactory) {
    if (DataProcessorService.instance) return DataProcessorService.instance;

    this.adapterFactory = adapterFactory;
    this.datosUnificados = [];
    this.duplicados = new Set();
    this.persistence = new DataPersistenceService();

    DataProcessorService.instance = this;
  }

  async procesarArchivo(filePath, tipoArchivo) {
    console.log(`Procesando archivo: ${filePath} de tipo ${tipoArchivo}`);
    
    const adapter = this.adapterFactory.crearAdapter(tipoArchivo);
    const datos = await adapter.convertirFormatoUnificado(filePath);

    const sinDup = this.eliminarDuplicados(datos);
    const enriquecidos = await this.enriquecerDatos(sinDup);

    // Normaliza los datos antes de agregarlos
    const normalizados = enriquecidos.map((reg) => ({
      ...reg,
      fecha: reg.venta?.fecha || reg.venta_fecha || reg.fecha || "",
      venta: reg.venta?.id || reg.venta_id || reg.id_venta || "",
      cliente: reg.cliente?.nombre || reg.cliente_nombre || reg.cliente || "",
      producto:
        reg.producto?.nombre ||
        reg.producto_nombre ||
        reg.nombre_producto ||
        "",
      categoria:
        reg.producto?.categoria ||
        reg.categoria_producto ||
        reg.categoria ||
        "",
      sucursal:
        reg.sucursal?.nombre ||
        reg.nombre_sucursal ||
        reg.sucursal_nombre ||
        "",
      cantidad: Number(reg.cantidad || reg.producto?.cantidad || 0),
      precio: Number(
        reg.precio_unitario || reg.producto?.precio_unitario || reg.precio || 0
      ),
    }));

    this.datosUnificados.push(...normalizados);

    // Persistir en BD
    await this.persistence.procesarLote(enriquecidos);

    return {
      procesados: enriquecidos.length,
      duplicados: datos.length - sinDup.length,
      total: this.datosUnificados.length,
    };
  }

  eliminarDuplicados(datos) {
    const res = [];
    for (const reg of datos) {
      const hash = this.generarHashRegistro(reg);
      if (!this.duplicados.has(hash)) {
        this.duplicados.add(hash);
        res.push(reg);
      }
    }
    return res;
  }

  generarHashRegistro(reg) {
    // Soporta tanto objetos planos como anidados
    const fecha = reg.fecha || reg.venta?.fecha;
    const producto = reg.producto_nombre || reg.producto?.nombre;
    const sucursal = reg.nombre_sucursal || reg.sucursal?.nombre;
    const cantidad = reg.cantidad || reg.producto?.cantidad;
    const precio = reg.precio_unitario || reg.producto?.precio_unitario;
    const cliente = reg.cliente_email || reg.cliente?.email;

    return `${fecha}_${producto}_${sucursal}_${cantidad}_${precio}_${cliente}`;
  }

  async enriquecerDatos(datos) {
    const out = [];
    for (const reg of datos) {
      try {
        out.push(await this.enriquecerProducto(reg));
      } catch (e) {
        console.error("Enriq error", e);
        out.push(reg);
      }
    }
    return out;
  }

  async enriquecerProducto(reg) {
    if (!reg.descripcion || reg.categoria === "Sin categoría") {
      const datosExt = await this.consultarAPIPublica(reg.producto);
      return {
        ...reg,
        descripcion: reg.descripcion || datosExt.descripcion,
        categoria:
          reg.categoria === "Sin categoría"
            ? datosExt.categoria
            : reg.categoria,
        proveedor: datosExt.proveedor || "No especificado",
      };
    }
    return reg;
  }

  async consultarAPIPublica(nombreProducto) {
    // simulación...
    await new Promise((r) => setTimeout(r, 100));
    return {
      categoria: "General",
      descripcion: `Prod ${nombreProducto}`,
      proveedor: "N/A",
    };
  }

  obtenerDatosUnificados() {
    return this.datosUnificados;
  }
  limpiarDatos() {
    this.datosUnificados = [];
    this.duplicados.clear();
  }
}
