class FileAdapter {
  constructor() {
    if (this.constructor === FileAdapter) {
      throw new Error("FileAdapter es una clase abstracta");
    }
  }
  async convertirFormatoUnificado(filePath) {
    throw new Error("convertirFormatoUnificado debe ser implementado por una subclase");
  }

  async validarEstructura(filePath, data) {
    throw new Error("guardarArchivo debe ser implementado por una subclase");
  }
}

  export default FileAdapter;


  

