import "server-only";
import type { Filter, ObjectId } from "mongodb";
import { getDb } from "../db";
import { CLINIC_TZ, SLOT_STEP_MIN } from "../config";
import type { Appointment } from "../models/appointment";
import type { Service } from "../models/service";
import type { Vet } from "../models/vet";
import type { Slot } from "../models/views";
import {
  appointmentInterval, buildSlots, dayBoundsUtc, fitsIn, overlaps,
  subtract, workingIntervals, type Interval,
} from "../availability";

/** Intervalos ocupados por citas activas (estado !== "cancelada") que matchean `filter` dentro de `range`. */
async function busyIntervalsBy(
  filter: Filter<Appointment>, range: Interval, excludeId?: ObjectId,
): Promise<Interval[]> {
  const db = await getDb();
  const services = await db.collection<Service>("services").find().toArray();
  const durations = new Map(services.map((s) => [s._id.toHexString(), s.duracionMin]));
  const maxDur = Math.max(0, ...durations.values());

  // Como la cita no guarda su fin, se mira hacia atrás la duración máxima de cualquier servicio
  // para atrapar turnos que empezaron antes del rango pero siguen en curso.
  const appts = await db.collection<Appointment>("appointments").find({
    ...filter,
    estado: { $ne: "cancelada" },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    fechaHora: { $gte: new Date(range.start.getTime() - maxDur * 60_000), $lt: range.end },
  }).toArray(); // usa el índice { vetId | petId, fechaHora }

  return appts
    .map((a) => appointmentInterval(a.fechaHora, durations.get(a.serviceId.toHexString()) ?? 0))
    .filter((i) => overlaps(i, range));
}

/** R14: slots del vet para una fecha local (YYYY-MM-DD). */
export async function getSlots(vet: Vet, dateISO: string, durationMin: number): Promise<Slot[]> {
  const day = dayBoundsUtc(dateISO, CLINIC_TZ);
  const busy = await busyIntervalsBy({ vetId: vet._id }, day);
  return buildSlots(workingIntervals(vet.horarios, dateISO, CLINIC_TZ), busy, durationMin, SLOT_STEP_MIN, new Date());
}

/** R11: ¿entra el turno? (`excludeId` sirve si algún día se reprograma una cita existente). */
export async function canBook(
  vet: Vet, start: Date, durationMin: number, dateISO: string, excludeId?: ObjectId,
): Promise<boolean> {
  const day = dayBoundsUtc(dateISO, CLINIC_TZ);
  const busy = await busyIntervalsBy({ vetId: vet._id }, day, excludeId);
  const free = subtract(workingIntervals(vet.horarios, dateISO, CLINIC_TZ), busy);
  return fitsIn(free, appointmentInterval(start, durationMin));
}

/** La mascota no puede tener dos turnos activos solapados (con cualquier vet). */
export async function petHasOverlap(
  petId: ObjectId, start: Date, durationMin: number, excludeId?: ObjectId,
): Promise<boolean> {
  const candidate = appointmentInterval(start, durationMin);
  const busy = await busyIntervalsBy({ petId }, candidate, excludeId);
  return busy.length > 0;
}
