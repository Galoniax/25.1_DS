import { z } from "zod";
/**
 * model User {
  id_user     Int    @id @default(autoincrement())
  email       String @unique
  password    String
  role        Role
  id_sucursal Int?

  sucursal Sucursal? @relation(fields: [id_sucursal], references: [id_sucursal])

  @@index([email], name: "idx_user_email")
  @@index([id_sucursal], name: "idx_user_id_sucursal")
}
 */

export const UserSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(4).max(100),
    role: z.enum(["sucursal", "marketing"]),
    id_sucursal: z.number().optional(),
  })
  .refine(
    (data) => {
      // Validación condicional: si role es "sucursal", id_sucursal es requerido
      if (data.role === "sucursal" && !data.id_sucursal) {
        return false;
      }
      return true;
    },
    {
      message: "id_sucursal es requerido para el rol 'sucursal'",
      path: ["id_sucursal"], // Especifica dónde mostrar el error
    }
  );
