import type { Id } from "./shared";

export interface Owner {
  _id: Id;
  nombre: string;
  apellido: string;
  email: string;        // único
  telefono: string;
  direccion?: string;
  createdAt: Date;
}
