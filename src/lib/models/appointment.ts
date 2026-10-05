import type { EstadoCita, Id } from "./shared";

export interface Appointment {
  _id: Id;
  ownerId: Id;          // → Owner
  petId: Id;            // → Pet
  vetId: Id;            // → Vet
  serviceId: Id;        // → Service
  fechaHora: Date;      // inicio del turno (UTC en DB)
  motivo?: string;
  estado: EstadoCita;   // default "pendiente"
  notas?: string;
  createdAt: Date;
}
