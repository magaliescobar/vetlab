import type { ObjectId } from "mongodb";

/** En DB: ObjectId. Serializado (cliente / JSON): string. */
export type Id = ObjectId;
export type IdString = string;

export type Especie =
  | "perro" | "gato" | "ave" | "roedor" | "reptil" | "otro";

export type EstadoCita =
  | "pendiente" | "confirmada" | "completada" | "cancelada";

export type DiaSemana =
  | "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";

/** Tramo de atención dentro de un día, formato "HH:mm" en hora local. */
export interface FranjaHoraria { desde: string; hasta: string; }

/** Horarios de atención de un vet, por día de la semana. */
export type Horarios = Partial<Record<DiaSemana, FranjaHoraria[]>>;
