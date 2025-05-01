import express from "express";
import { swaggerDocs } from "./docs/swagger.js";

import { API_PREFIX } from "./config/config.js";

import __dirname from "../dirname.js";

import path from "path";

const app = express();
const port = 5000;

import { ventaRouter } from "./routes/ventaRoutes.js";

// Middleware para parsear el cuerpo de las peticiones
app.use(express.json());

// Middleware para servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

// Middleware para parsear el cuerpo de las peticiones
app.use(express.urlencoded({ extended: true }));

// Endpoint
app.use(`${API_PREFIX[0]}/ventas`, ventaRouter);

// Documentación de la API
swaggerDocs(app);

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
