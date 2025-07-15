import { CSVAdapter } from "./CSVAdapter.js";
import { ExcelAdapter } from "./ExcelAdapter.js";

export class AdapterFactory {
  crearAdapter(tipo, configuracion) {
    switch (tipo) {
      case "csv":
        return new CSVAdapter(configuracion);
      //case "excel":
        //return new ExcelAdapter();
      default:
        throw new Error(`Tipo de adaptador desconocido: ${tipo}`);
    }
  }

  obtenerTipoArchivo(nombreArchivo) {
    const extension = nombreArchivo.split(".").pop().toLowerCase();
    return extension;
  }
}

export default AdapterFactory;
