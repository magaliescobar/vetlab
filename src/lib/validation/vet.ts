import { z } from "zod";
import { objectIdString } from "./appointment";

export const vetUpdateSchema = z.object({
  id: objectIdString,
  nombre: z.string().trim().min(1, "Nombre requerido").max(100),
  especialidad: z.string().trim().min(1, "Especialidad requerida").max(100),
  bio: z.string().trim().max(500).optional(),
});
