import jwt from "jsonwebtoken"; 
import { SECRET_KEY } from "../config/config.js";  

// Función para crear un token JWT
export const createToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { algorithm: "HS256", expiresIn: "24h" });
};

// Función para verificar el token JWT
export const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);  
};