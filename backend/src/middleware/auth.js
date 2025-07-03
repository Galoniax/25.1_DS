import jwt from "jsonwebtoken"; 
import { SECRET_KEY } from "../config/config.js";

export const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    req.usuario = decoded;
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

export const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    try {
      const usuario = req.usuario;
      
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!rolesPermitidos.includes(usuario.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esta acción'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error verificando permisos'
      });
    }
  };
};

export const verificarSucursal = (req, res, next) => {
  try {
    const usuario = req.usuario;
    
    // Si es usuario de marketing, puede acceder a todo
    if (usuario.role === 'marketing') {
      return next();
    }
    
    // Si es usuario de sucursal, solo puede acceder a su propia información
    if (usuario.role === 'sucursal') {
      const sucursalSolicitada = req.params.sucursal || req.query.sucursal || req.body.sucursal;
      
      if (sucursalSolicitada && sucursalSolicitada !== usuario.sucursal) {
        return res.status(403).json({
          success: false,
          message: 'No puedes acceder a información de otras sucursales'
        });
      }
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verificando acceso a sucursal'
    });
  }
};