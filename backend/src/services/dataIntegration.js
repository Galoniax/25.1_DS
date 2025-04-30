const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs').promises;

// Importar adaptadores
const csvAdapter = require('../adapters/csvAdapter');
const excelAdapter = require('../adapters/excelAdapter');
const jsonApiAdapter = require('../adapters/jsonApiAdapter');
const xmlApiAdapter = require('../adapters/xmlApiAdapter');

// Configuración de las sucursales y sus fuentes de datos
const BRANCH_CONFIGS = [
  {
    id: 1,
    name: 'Sucursal Centro',
    dataSource: {
      type: 'json_api',
      url: 'https://api.sucursalcentro.com/ventas',
      options: {
        headers: { 'Authorization': 'Bearer TOKEN_SUCURSAL_CENTRO' },
        dataPath: 'data.ventas',
        fieldMapping: {
          'id': 'ventaId',
          'product_id': 'productoId',
          'quantity': 'cantidad',
          'unit_price': 'precioUnitario',
          'sale_date': 'fechaVenta'
        }
      }
    }
  },
  {
    id: 2,
    name: 'Sucursal Norte',
    dataSource: {
      type: 'excel',
      filePath: '/data/imports/sucursal_norte_ventas.xlsx',
      options: {
        sheetName: 'Ventas',
        headerRow: 1,
        fieldMapping: {
          'ID Venta': 'ventaId',
          'Código Producto': 'productoId',
          'Unidades': 'cantidad',
          'Precio': 'precioUnitario',
          'Fecha': 'fechaVenta'
        }
      }
    }
  },
  {
    id: 3,
    name: 'Sucursal Sur',
    dataSource: {
      type: 'csv',
      filePath: '/data/imports/sucursal_sur_ventas.csv',
      options: {
        csvOptions: { 
          separator: ';'
        },
        fieldMapping: {
          'venta_id': 'ventaId',
          'producto': 'productoId',
          'cant': 'cantidad',
          'precio_unit': 'precioUnitario',
          'fecha': 'fechaVenta'
        }
      }
    }
  },
  {
    id: 4,
    name: 'Sucursal Este',
    dataSource: {
      type: 'xml_api',
      url: 'https://api.sucursaleste.com/export/ventas',
      options: {
        dataPath: 'response.ventas.venta',
        fieldMapping: {
          'id': 'ventaId',
          'producto_id': 'productoId',
          'cantidad': 'cantidad',
          'precio': 'precioUnitario',
          'fecha': 'fechaVenta'
        }
      }
    }
  }
];

/**
 * Obtiene y normaliza datos de todas las sucursales
 * @returns {Promise<Array>} Datos normalizados de todas las sucursales
 */
async function fetchAllBranchData() {
  const allData = [];
  
  for (const branch of BRANCH_CONFIGS) {
    try {
      console.log(`Obteniendo datos de ${branch.name}...`);
      
      const branchData = await fetchBranchData(branch);
      
      // Añadir identificador de sucursal a cada registro
      const processedData = branchData.map(item => ({
        ...item,
        sucursalId: branch.id,
        sucursalNombre: branch.name
      }));
      
      allData.push(...processedData);
      console.log(`Datos obtenidos de ${branch.name}: ${processedData.length} registros`);
    } catch (error) {
      console.error(`Error al obtener datos de ${branch.name}:`, error.message);
      // Continuar con la siguiente sucursal en caso de error
    }
  }
  
  return allData;
}

/**
 * Obtiene datos de una sucursal específica según su configuración
 * @param {Object} branch - Configuración de la sucursal
 * @returns {Promise<Array>} - Datos normalizados de la sucursal
 */
async function fetchBranchData(branch) {
  const { type, url, filePath, options } = branch.dataSource;
  
  switch (type) {
    case 'json_api':
      return jsonApiAdapter.fetchData(url, options);
      
    case 'xml_api':
      return xmlApiAdapter.fetchData(url, options);
      
    case 'csv':
      const csvContent = await csvAdapter.readFile(filePath);
      return csvAdapter.processData(csvContent, options);
      
    case 'excel':
      const excelContent = await excelAdapter.readFile(filePath);
      return excelAdapter.processData(excelContent, options);
      
    default:
      throw new Error(`Tipo de fuente de datos no soportado: ${type}`);
  }
}

/**
 * Limpia y normaliza los datos combinados de todas las sucursales
 * @param {Array} data - Datos crudos de todas las sucursales
 * @returns {Array} - Datos limpios y normalizados
 */
function cleanAndNormalizeData(data) {
  return data.map(item => {
    // Conversión de formatos de fecha (podría venir en diferentes formatos)
    const fechaVenta = normalizeDate(item.fechaVenta);
    
    // Conversión de tipos de datos
    const cantidad = parseInt(item.cantidad, 10);
    const precioUnitario = parseFloat(item.precioUnitario);
    
    // Validación básica
    if (isNaN(cantidad) || isNaN(precioUnitario) || !fechaVenta) {
      console.warn('Registro con datos inválidos:', item);
      return null; // Será filtrado más adelante
    }
    
    // Retornar objeto normalizado
    return {
      ventaId: item.ventaId?.toString(),
      productoId: item.productoId?.toString(),
      cantidad,
      precioUnitario,
      fechaVenta,
      sucursalId: item.sucursalId,
      // Calcular total
      total: cantidad * precioUnitario
    };
  }).filter(Boolean); // Filtrar registros inválidos
}

/**
 * Normaliza diferentes formatos de fecha a un objeto Date
 * @param {string|Date} dateInput - Fecha en cualquier formato
 * @returns {Date|null} - Objeto Date normalizado o null si es inválido
 */
function normalizeDate(dateInput) {
  if (!dateInput) return null;
  
  // Si ya es un objeto Date
  if (dateInput instanceof Date) return dateInput;
  
  // Intentar parsear la fecha
  const date = new Date(dateInput);
  
  // Verificar si es una fecha válida
  if (isNaN(date.getTime())) {
    // Intentar con formatos específicos
    const formats = [
      // DD/MM/YYYY
      {
        regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        parse: (m) => new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]))
      },
      // DD-MM-YYYY
      {
        regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
        parse: (m) => new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]))
      },
      // YYYY/MM/DD
      {
        regex: /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
        parse: (m) => new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]))
      }
    ];
    
    for (const format of formats) {
      const match = dateInput.match(format.regex);
      if (match) {
        return format.parse(match);
      }
    }
    
    return null;
  }
  
  return date;
}

/**
 * Elimina duplicados de los datos
 * @param {Array} data - Datos normalizados
 * @returns {Array} - Datos sin duplicados
 */
function removeDuplicates(data) {
  const uniqueKeys = new Set();
  return data.filter(item => {
    // Crear una clave única basada en ventaId + productoId + sucursalId
    const key = `${item.ventaId}-${item.productoId}-${item.sucursalId}`;
    
    if (uniqueKeys.has(key)) {
      return false; // Duplicado
    }
    
    uniqueKeys.add(key);
    return true;
  });
}


/**
 * Obtiene, procesa y almacena datos de todas las sucursales
 * @returns {Promise<Object>} Resultado de la operación
 */
async function integrateAllData() {
  try {
    // 1. Obtener datos crudos de todas las sucursales
    const rawData = await fetchAllBranchData();
    
    // 2. Limpiar y normalizar los datos
    const cleanData = cleanAndNormalizeData(rawData);
    
    // 3. Eliminar duplicados
    const uniqueData = removeDuplicates(cleanData);
    
    // 4. Almacenar en la base de datos
    const result = await saveDataToDatabase(uniqueData);
    
    return {
      success: true,
      totalProcessed: rawData.length,
      totalCleaned: cleanData.length,
      totalUnique: uniqueData.length,
      totalSaved: result.count
    };
  } catch (error) {
    console.error('Error en la integración de datos:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Guarda los datos normalizados en la base de datos
 * @param {Array} data - Datos limpios y normalizados
 * @returns {Promise<Object>} - Resultado de la operación
 */
async function saveDataToDatabase(data) {
  // Aquí usamos Prisma para guardar los datos
  // Esta es una implementación simplificada
  let count = 0;
  
  for (const item of data) {
    try {
      // Buscar o crear la venta
      let venta = await prisma.venta.findFirst({
        where: {
          AND: [
            { sucursalId: item.sucursalId },
            { fechaVenta: item.fechaVenta }
          ]
        }
      });
      
      if (!venta) {
        venta = await prisma.venta.create({
          data: {
            sucursalId: item.sucursalId,
            fechaVenta: item.fechaVenta,
            total: 0 // Se actualizará después
          }
        });
      }
      
      // Agregar el detalle de venta
      await prisma.detalleVenta.create({
        data: {
          ventaId: venta.id,
          productoId: parseInt(item.productoId),
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario
        }
      });
      
      // Actualizar el total de la venta
      await prisma.venta.update({
        where: { id: venta.id },
        data: { 
          total: { increment: item.cantidad * item.precioUnitario } 
        }
      });
      
      count++;
    } catch (error) {
      console.error('Error al guardar elemento:', error, item);
      // Continuar con el siguiente elemento
    }
  }
  
  return { count };
}

module.exports = {
  integrateAllData,
  fetchAllBranchData,
  cleanAndNormalizeData,
  removeDuplicates
};