import type { Especie, Id } from "./shared";

export interface Pet {
  _id: Id;
  ownerId: Id;          // → Owner
  nombre: string;
  especie: Especie;
  raza?: string;
  fechaNacimiento?: Date;
  pesoKg?: number;
  fotoUrl?: string;
  notas?: string;
}
