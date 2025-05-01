# 25.1_DS - Sistema de Equipo de Marketing
---
# Introducción 
Este proyecto es una API RESTful desarrollada con Node.js, Express.js y Prisma ORM, diseñada para gestionar información de ventas en una empresa de marketing digital. Actualmente, la API puede realizar operaciones como consultar todas las ventas, obtener detalles de una venta específica y filtrar ventas por sucursal.

Además, incluye documentación interactiva mediante Swagger UI para facilitar la exploración y prueba de los endpoints disponibles.

El objetivo principal es centralizar y automatizar el acceso a los datos de ventas para integrarlos con otros procesos del negocio, como análisis, generación de reportes y monitoreo. 

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
- http://localhost:5000/api-docs (Swagger) (npm run dev + docker-compose up)
---





