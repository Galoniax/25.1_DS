import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";


import { authRouter } from "./routes/authRoutes.js";
import { uploadRouter } from "./routes/uploadRoutes.js";
import { reportRouter } from "./routes/reportRoutes.js";
import { ventaRouter } from "./routes/ventaRoutes.js";
import { userRouter } from "./routes/userRoutes.js";
import { sucursalRouter } from "./routes/sucursalRoutes.js";
import { categoriaRouter } from "./routes/categoriaRoutes.js";
import { DailyScheduler } from "./scheduler/dailyScheduler.js";

import { API_PREFIX, SECRET_KEY } from "./config/config.js";

import { swaggerDocs } from './docs/swagger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Crear carpetas necesarias
["uploads","reports","archive"].forEach(dir=> {
  const full = path.join(process.cwd(),dir);
  if(!fs.existsSync(full)) fs.mkdirSync(full,{recursive:true});
});

// Middlewares
app.use(cors());
app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({limit:"50mb",extended:true}));
app.use("/reports",express.static(path.join(process.cwd(),"reports")));

// Rutas
app.use(`${API_PREFIX}/auth`,authRouter);
app.use(`${API_PREFIX}/upload`,uploadRouter);
app.use(`${API_PREFIX}/reports`,reportRouter);
app.use(`${API_PREFIX}/ventas`,ventaRouter);
app.use(`${API_PREFIX}/users`,userRouter);
app.use(`${API_PREFIX}/sucursales`,sucursalRouter);
app.use(`${API_PREFIX}/categorias`,categoriaRouter);

swaggerDocs(app);

// Health-check y 404
app.get("/health",(req,res)=>res.json({ok:true}));
app.use((_,res)=>res.status(404).json({error:"No encontrado"}));

// Iniciar el scheduler diario
const scheduler = new DailyScheduler();
scheduler.iniciar();

//scheduler.ejecutarManual();


app.listen(PORT,()=>{
  console.log("Servidor en puerto",PORT);
});
