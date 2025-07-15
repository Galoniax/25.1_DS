import { DataPersistenceService } from "./DataPersistenceService.js";
import { prisma } from "../providers/prisma.js";

export class DataProcessorService {
  constructor(adapterFactory) {
    if (DataProcessorService.instance) return DataProcessorService.instance;

    this.adapterFactory = adapterFactory;
    this.datosUnificados = [];
    this.duplicados = new Set();
    this.persistence = new DataPersistenceService();

    DataProcessorService.instance = this;
  }

  async procesarArchivo(filePath, tipoArchivo, idSucursal) {
    console.log(
      `Procesando archivo: ${filePath} de tipo ${tipoArchivo} para sucursal ${idSucursal}`
    );

    const configuracion = await this.obtenerConfiguracion(idSucursal);

    const adapter = this.adapterFactory.crearAdapter(
      tipoArchivo,
      configuracion
    );
    const datos = await adapter.convertirFormatoUnificado(filePath);

    const sinDup = this.eliminarDuplicados(datos);
    const enriquecidos = await this.enriquecerDatos(sinDup);

    // Normaliza los datos antes de agregarlos
    const normalizados = enriquecidos.map((reg) => ({
      ...reg,
      cantidad: Number(reg.cantidad ?? 0),
      precio: Number(reg.precio ?? 0),
      fecha: reg.fecha ?? "",
      producto: reg.producto ?? "",
      sucursal: reg.sucursal ?? "",
      cliente: reg.cliente ?? "",
      categoria: reg.categoria ?? "",
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

  camposClave = [
    "fecha",
    "producto",
    "sucursal",
    "cantidad",
    "precio",
    "cliente",
    "categoria",
    "venta_id",
    "total",
  ];

  generarHashRegistro(reg) {
    return this.camposClave.map((campo) => reg[campo] ?? "").join("_");
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

  async obtenerConfiguracion(idSucursal) {
    const fuente = await prisma.fuenteDatos.findFirst({
      where: { id_sucursal: idSucursal },
    });
    return fuente?.configuracion || null;
  }
}
