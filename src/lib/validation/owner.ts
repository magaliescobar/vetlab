import { z } from "zod";
import type { Especie } from "../models/shared";

const ESPECIES = [
  "perro",
  "gato",
  "ave",
  "roedor",
  "reptil",
  "otro",
] satisfies Especie[];

/** Campos del formulario "nuevo dueño + primera mascota" (nombres planos de FormData). */
export const ownerWithPetSchema = z.object({
  nombre: z.string().trim().min(1, "Nombre requerido").max(100),
  apellido: z.string().trim().min(1, "Apellido requerido").max(100),
  email: z.email("Email inválido").max(200),
  telefono: z.string().trim().min(6, "Teléfono requerido").max(30),
  direccion: z.string().trim().max(200).optional(),
  petNombre: z.string().trim().min(1, "Nombre de la mascota requerido").max(100),
  petEspecie: z.enum(ESPECIES),
  petRaza: z.string().trim().max(100).optional(),
  petFechaNacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
    .optional()
    .or(z.literal("")),
  petPesoKg: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Peso inválido")
    .optional()
    .or(z.literal("")),
  petFotoUrl: z.string().trim().max(500).optional().or(z.literal("")),
  petNotas: z.string().trim().max(500).optional(),
});

export const petSchema = z.object({
  petNombre: z.string().trim().min(1, "Nombre de la mascota requerido").max(100),
  petEspecie: z.enum(ESPECIES),
  petRaza: z.string().trim().max(100).optional(),
  petFechaNacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
    .optional()
    .or(z.literal("")),
  petPesoKg: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Peso inválido")
    .optional()
    .or(z.literal("")),
  petFotoUrl: z.string().trim().max(500).optional().or(z.literal("")),
  petNotas: z.string().trim().max(500).optional(),
});
