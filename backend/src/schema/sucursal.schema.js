import { z } from 'zod';

/**
 * model Sucursal {
  id_sucursal Int    @id @default(autoincrement())
  nombre      String @unique
  ubicacion   String
  activo Boolean @default(true)

  fuenteDatos FuenteDatos[]
  stocks      Stock[]
  ventas      Venta[]
  reportes    Reporte[]
  users       User[]
}

model FuenteDatos {
  id_fuente     Int      @id @default(autoincrement())
  id_sucursal   Int
  tipo          FuenteDatosTipo
  configuracion Json
  updated_at    DateTime @updatedAt

  sucursal Sucursal @relation(fields: [id_sucursal], references: [id_sucursal])

  @@index([id_sucursal], name: "idx_fuente_datos_id_sucursal")
}
 */

export const SucursalSchema = z.object({
  id_sucursal: z.number().optional(),
  nombre: z.string().min(3).max(100),
  ubicacion: z.string().min(3).max(100),
  activo: z.boolean().default(true),
});

export const FuenteDatosSchema = z.object({
  id_fuente: z.number().optional(),
  id_sucursal: z.number().optional(),
  tipo: z.enum(["xml", "json", "csv", "excel", "api"]),
  configuracion: z.any(),
  updated_at: z.date().optional(),
}).refine(data => {
  if (data.tipo === "api" && typeof data.configuracion !== "object") {
    return false;
  }
  return true;
}, {
  message: "El campo configuracion debe ser un objeto cuando el tipo es 'api'."
});

export const CreateSucursalSchema = z.object({
  nombre: z.string().min(3).max(100),
  ubicacion: z.string().min(3).max(100),
  activo: z.boolean().default(true),
  
  // Datos de la fuente de datos
  tipo: z.enum(["xml", "json", "csv", "excel", "api"]),
  configuracion: z.any(), // o usar z.record() para un objeto genérico
}).refine(data => {
  if (data.tipo === "api" && typeof data.configuracion !== "object") {
    return false;
  }
  return true;
}, {
  message: "El campo configuracion debe ser un objeto cuando el tipo es 'api'."
});