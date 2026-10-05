import "server-only";
import { cache } from "react";
import { ObjectId, type Filter } from "mongodb";
import { getDb } from "../db";
import type { Appointment } from "../models/appointment";
import type { Owner } from "../models/owner";
import type { Pet } from "../models/pet";
import type { Vet } from "../models/vet";
import type { Service } from "../models/service";
import type { AppointmentView } from "../models/views";
import type { EstadoCita } from "../models/shared";
import { serialize, type Serialized } from "../models/serialized";
import { dayBoundsUtc } from "../availability";
import { CLINIC_TZ } from "../config";

function byId<T extends { _id: ObjectId }>(docs: T[]): Map<string, T> {
  return new Map(docs.map((d) => [d._id.toHexString(), d]));
}

/**
 * "Popula" las refs de las citas con consultas por lotes ($in) y arma
 * AppointmentView. Citas con refs rotas se descartan (deberían ser imposibles).
 */
async function populate(appts: Appointment[]): Promise<AppointmentView[]> {
  if (appts.length === 0) return [];
  const db = await getDb();
  const ids = (sel: (a: Appointment) => ObjectId) => ({
    $in: [...new Set(appts.map((a) => sel(a).toHexString()))].map(
      (h) => new ObjectId(h),
    ),
  });

  const [owners, pets, vets, services] = await Promise.all([
    db.collection<Owner>("owners").find({ _id: ids((a) => a.ownerId) }).toArray(),
    db.collection<Pet>("pets").find({ _id: ids((a) => a.petId) }).toArray(),
    db.collection<Vet>("vets").find({ _id: ids((a) => a.vetId) }).toArray(),
    db.collection<Service>("services").find({ _id: ids((a) => a.serviceId) }).toArray(),
  ]);
  const ownerMap = byId(owners);
  const petMap = byId(pets);
  const vetMap = byId(vets);
  const serviceMap = byId(services);

  const views: AppointmentView[] = [];
  for (const a of appts) {
    const owner = ownerMap.get(a.ownerId.toHexString());
    const pet = petMap.get(a.petId.toHexString());
    const vet = vetMap.get(a.vetId.toHexString());
    const service = serviceMap.get(a.serviceId.toHexString());
    if (!owner || !pet || !vet || !service) continue;
    views.push({
      _id: a._id,
      fechaHora: a.fechaHora,
      motivo: a.motivo,
      estado: a.estado,
      notas: a.notas,
      createdAt: a.createdAt,
      owner: { _id: owner._id, nombre: owner.nombre, apellido: owner.apellido },
      pet: { _id: pet._id, nombre: pet.nombre, especie: pet.especie },
      vet: { _id: vet._id, nombre: vet.nombre, especialidad: vet.especialidad },
      service: {
        _id: service._id,
        nombre: service.nombre,
        duracionMin: service.duracionMin,
      },
    });
  }
  return views;
}

const asViews = async (appts: Appointment[]) => serialize(await populate(appts));

/** R06: citas del día local `dateISO` (YYYY-MM-DD), opcionalmente por estado. */
export async function getAppointmentsByDate(
  dateISO: string,
  estado?: EstadoCita,
): Promise<Serialized<AppointmentView[]>> {
  const db = await getDb();
  const day = dayBoundsUtc(dateISO, CLINIC_TZ);
  const filter: Filter<Appointment> = {
    fechaHora: { $gte: day.start, $lt: day.end },
    ...(estado ? { estado } : {}),
  };
  const appts = await db
    .collection<Appointment>("appointments")
    .find(filter)
    .sort({ fechaHora: 1 })
    .toArray();
  return asViews(appts);
}

/** R08: historial de citas de un dueño, más recientes primero. */
export async function getAppointmentsByOwner(
  ownerId: ObjectId,
): Promise<Serialized<AppointmentView[]>> {
  const db = await getDb();
  const appts = await db
    .collection<Appointment>("appointments")
    .find({ ownerId })
    .sort({ fechaHora: -1 })
    .toArray();
  return asViews(appts);
}

/** Feed del calendario (/api/citas): citas en un rango UTC, opcional por vet. */
export async function getAppointmentsInRange(
  from: Date,
  to: Date,
  vetId?: ObjectId,
): Promise<Serialized<AppointmentView[]>> {
  const db = await getDb();
  const filter: Filter<Appointment> = {
    fechaHora: { $gte: from, $lt: to },
    ...(vetId ? { vetId } : {}),
  };
  const appts = await db
    .collection<Appointment>("appointments")
    .find(filter)
    .sort({ fechaHora: 1 })
    .toArray();
  return asViews(appts);
}

export const getAppointmentById = cache(async function getAppointmentById(
  id: ObjectId,
): Promise<Appointment | null> {
  const db = await getDb();
  return db.collection<Appointment>("appointments").findOne({ _id: id });
});
