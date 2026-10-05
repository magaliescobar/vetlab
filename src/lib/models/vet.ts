import type { Horarios, Id } from "./shared";

export interface Vet {
  _id: Id;
  nombre: string;
  especialidad: string;
  bio?: string;
  fotoUrl?: string;
  horarios: Horarios;   // define la disponibilidad base
}
