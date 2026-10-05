import type { Appointment } from "./appointment";
import type { Owner } from "./owner";
import type { Pet } from "./pet";
import type { Service } from "./service";
import type { Vet } from "./vet";
import type { IdString } from "./shared";

// Respuesta de GET /api/disponibilidad (R14)
export interface Slot {
  inicio: string;      // ISO
  fin: string;         // ISO
  disponible: boolean;
}

// Cita "populada" con sus refs, para dashboard / perfil (R06 / R08)
export interface AppointmentView
  extends Omit<Appointment, "ownerId" | "petId" | "vetId" | "serviceId"> {
  owner: Pick<Owner, "_id" | "nombre" | "apellido">;
  pet: Pick<Pet, "_id" | "nombre" | "especie">;
  vet: Pick<Vet, "_id" | "nombre" | "especialidad">;
  service: Pick<Service, "_id" | "nombre" | "duracionMin">;
}

// Input de creación de cita: lo que manda el form (sin _id/createdAt, ids como string)
export type NewAppointmentInput = {
  ownerId: IdString;
  petId: IdString;
  vetId: IdString;
  serviceId: IdString;
  fechaHora: string;   // ISO en hora local → el server normaliza a UTC
  motivo?: string;
};
