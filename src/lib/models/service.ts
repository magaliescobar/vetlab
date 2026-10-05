import type { Id } from "./shared";

export interface Service {
  _id: Id;
  slug: string;         // único · identificador legible (no hay ruta pública)
  nombre: string;
  descripcion: string;
  duracionMin: number;  // cuánto ocupa el turno en la agenda
  precio: number;       // informativo (el lab no cobra)
  activo?: boolean;     // default true
}
