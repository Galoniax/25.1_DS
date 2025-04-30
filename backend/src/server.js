import express from 'express';

import { API_PREFIX } from './config.js';

import __dirname from '../dirname.js';

const swaggerUi = require ('swagger-ui-express'); 
const swaggerDocument = require ('./swagger.json');

import path from 'path';

const app = express();
const port = 5000;

funcion()

// Middleware para parsear el cuerpo de las peticiones
app.use(express.json());

// Middleware para servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para parsear el cuerpo de las peticiones
app.use(express.urlencoded({ extended: true }));

// Endpoint 
app.use(`${API_PREFIX[1]}/`, swaggerUi.serve, swaggerUi.setup());

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});





