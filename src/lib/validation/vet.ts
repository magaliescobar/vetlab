import { z } from "zod";
import { objectIdString } from "./appointment";

const DIAS_SEMANA = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"] as const;

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida");

const franjaSchema = z
  .object({ desde: hhmm, hasta: hhmm })
  .refine((f) => f.desde < f.hasta, {
    message: "El inicio debe ser anterior al fin",
  });

export const horariosSchema = z.partialRecord(
  z.enum(DIAS_SEMANA),
  z.array(franjaSchema).min(1),
);

/** Llega como JSON string desde el hidden input del form. */
const horariosJson = z
  .string()
  .transform((s, ctx) => {
    try {
      return JSON.parse(s) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "Horarios inválidos" });
      return z.NEVER;
    }
  })
  .pipe(horariosSchema)
  .optional();

const vetBase = {
  nombre: z.string().trim().min(1, "Nombre requerido").max(100),
  especialidad: z.string().trim().min(1, "Especialidad requerida").max(100),
  bio: z.string().trim().max(500).optional(),
  horarios: horariosJson,
};

export const vetUpdateSchema = z.object({ id: objectIdString, ...vetBase });

export const vetCreateSchema = z.object(vetBase);
