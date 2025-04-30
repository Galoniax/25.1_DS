const fs = require('fs').promises;
const csv = require('csv-parser');
const { Readable } = require('stream');

module.exports = {
  /**
   * Procesa un archivo CSV y normaliza su contenido
   * @param {string|Buffer} fileContent - Contenido del archivo CSV
   * @param {Object} options - Opciones de mapeo de campos
   * @returns {Promise<Array>} - Datos normalizados
   * @param {Object} [options.fieldMapping] - Configuración de mapeo de campos {originalField: normalizedField}
   * @param {Object} [options.csvOptions] - Opciones para el parser de CSV
   */
  async processData(fileContent, options = {}) {
    const results = [];
    
    // Crear un stream a partir del contenido del archivo
    const stream = Readable.from([fileContent.toString()]);
    
    // Procesar el CSV
    return new Promise((resolve, reject) => {
      stream
        .pipe(csv(options.csvOptions || {}))
        .on('data', (data) => {
          // Aplicar mapeo de campos si se proporciona
          const mappedData = mapFields(data, options.fieldMapping || {});
          results.push(mappedData);
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  },
  
  /**
   * Lee un archivo CSV del sistema de archivos
   * @param {string} filePath - Ruta al archivo
   * @returns {Promise<Buffer>} - Contenido del archivo
   */
  async readFile(filePath) {
    return fs.readFile(filePath);
  }
};

/**
 * Mapea campos según la configuración proporcionada
 * @param {Object} data - Datos originales
 * @param {Object} mapping - Configuración de mapeo {originalField: normalizedField}
 * @returns {Object} - Datos con campos mapeados
 */
function mapFields(data, mapping) {
  const result = {};
  
  // Si no hay mapeo, devolver los datos tal cual
  if (Object.keys(mapping).length === 0) {
    return data;
  }
  
  // Aplicar el mapeo de campos
  Object.keys(mapping).forEach((originalField) => {
    if (data[originalField] !== undefined) {
      result[mapping[originalField]] = data[originalField];
    }
  });
  
  return result;
}