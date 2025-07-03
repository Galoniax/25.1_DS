# 25.1_DS - Sistema de Equipo de Marketing
---
# Introducción 
Este proyecto es una API RESTful desarrollada con Node.js, Express.js y Prisma ORM, diseñada para gestionar información de ventas en una empresa de marketing digital. Actualmente, la API puede realizar operaciones como consultar todas las ventas, obtener detalles de una venta específica y filtrar ventas por sucursal.

Además, incluye documentación interactiva mediante Swagger UI para facilitar la exploración y prueba de los endpoints disponibles.

El objetivo principal es centralizar y automatizar el acceso a los datos de ventas para integrarlos con otros procesos del negocio, como análisis, generación de reportes y monitoreo. 

## 3/07 Update:
El sistema (luego de realizar los scripts para levantar), permite el inicio y registros de usuarios ya sean de marketing o de sucursal (los de sucursal necesitan si o si tener un id_sucursal). El sistema le permite a usuarios de una sucursal cargar archivos CSV para que sean analizados y cargados en la base de datos. Con el cron, se podrá realizar un reporte (que será guardado en la carpeta reports) con el cual se podrán ver todas las ventas de los diferentes CSVs cargados en el día "El cron se realiza alrededor de las 23:00pm". Para subir archivos como usuario de sucursal, el usuario debe haber iniciado sesión y con ello introducir el token de autenticación.
- En el GitHub, hay un archivo CSV (archivo-1751553972642-805255235.csv) con el que se puede realizar la prueba de carga.
- Si se quiere realizar un reporte ahora mismo, se deben eliminar los // de la función scheduler.ejecutarManual() dentro del archivo server.js

## Tecnologías aplicadas
- **JavaScript**
- **Express.js**
- **Prisma / Docker**
- **PostgreSQL**
- **Swagger** 

---


## Scripts para levantar
- npm run dev: Inicia la aplicación en modo desarrollo. Usar comando en carpeta backend **(cd .\backend\)**.
- docker-compose up: Levanta docker y la base de datos.

## Instalación
1. Clonación
   - ```git clone https://github.com/Galoniax/24.2_PD.git```
2. Posicionamiento
   - ```cd .\backend\```
3. Dependencias
   - ```npm install```
4. Base de datos
   - ```npx prisma migrate dev```
5. Tablas prueba
   - ```npx prisma db seed```
6. Inicialización
   - ```npm run dev```
  
---

## Dependencias 
### Backend
- prisma (^6.7.0): Cliente de Prisma para consultar tu base de datos desde el backend.
- express (^5.1.0): Framework web minimalista y rápido para crear APIs.
- swagger-ui-express (^5.0.1): Middleware para servir la documentación Swagger desde Express.
- yamljs (^0.3.0): Carga y parsea archivos .yaml (como la documentación Swagger).
- nodemon (^3.1.9): Reinicia automáticamente el servidor al detectar cambios en el código.
- bcrypt (^6.0.0): Una librería para hashear contraseñas.
- cors (^2.8.5): CORS (Cross-Origin Resource Sharing) es un middleware de Express que permite que tu backend maneje solicitudes de diferentes orígenes.
- csv-parser (^3.2.0): Un módulo Node.js simple y eficiente para analizar archivos CSV (valores separados por comas).
- exceljs (^4.4.0): Una librería para leer, escribir y manipular archivos de Excel (XLSX).
- fs (^0.0.1): El módulo File System incorporado de Node.js. Proporciona métodos para interactuar con el sistema de archivos, como leer o escribir en archivos.
- jsonwebtoken (^9.0.2): Una librería para implementar JSON Web Tokens (JWT). Los JWTs se utilizan comúnmente para la autenticación.
- multer (^2.0.1): Un middleware de Express para manejar multipart/form-data, utilizado principalmente para subir archivos
- node-cron (^4.1.1): Un módulo para programar tareas (cron jobs) en Node.js.
- yamljs (^0.3.0): Un analizador y "stringifier" de JavaScript para YAML

### Comandos
- npm init -y
- npm install @prisma/client express
- npm install --save-dev nodemon prisma
- npm install swagger-ui-express
- npm install yamljs
- npx prisma init
- npx prisma migrate dev

---
## Documentación (Swagger + SRS)
- https://docs.google.com/document/d/11GSC8PjYjjmDLd3NCeVXezoTDtOBnSn4pjL3kbu48hA/edit?usp=sharing
- http://localhost:3000/api-docs (Swagger) (npm run dev + docker-compose up)
---





