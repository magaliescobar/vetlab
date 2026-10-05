import { z } from "zod";

export const objectIdString = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Identificador inválido");

/** ISO local sin offset: "2026-10-05T09:30" */
export const fechaHoraLocal = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "Fecha y hora inválidas");

export const newAppointmentSchema = z.object({
  ownerId: objectIdString,
  petId: objectIdString,
  vetId: objectIdString,
  serviceId: objectIdString,
  fechaHora: fechaHoraLocal,
  motivo: z.string().trim().max(500).optional(),
});

export const updateEstadoSchema = z.object({
  id: objectIdString,
  estado: z.enum(["pendiente", "confirmada", "completada", "cancelada"]),
});
