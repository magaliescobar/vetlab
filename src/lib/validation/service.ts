import { z } from "zod";
import { objectIdString } from "./appointment";

const serviceBase = {
  nombre: z.string().trim().min(1, "Nombre requerido").max(100),
  descripcion: z.string().trim().max(500).optional(),
  duracionMin: z.coerce
    .number()
    .int("Debe ser un número entero de minutos")
    .min(5, "Mínimo 5 minutos")
    .max(480, "Máximo 480 minutos"),
  precio: z.coerce.number().min(0, "No puede ser negativo"),
};

export const serviceCreateSchema = z.object(serviceBase);

export const serviceUpdateSchema = z.object({
  id: objectIdString,
  ...serviceBase,
});
