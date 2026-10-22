"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { getOwnerById } from "@/lib/data/owners";
import { getVetById } from "@/lib/data/vets";
import { getServiceById } from "@/lib/data/services";
import { getAppointmentById } from "@/lib/data/appointments";
import { canBook, petHasOverlap } from "@/lib/data/availability";
import { localToUtc } from "@/lib/availability";
import { CLINIC_TZ, SLOT_STEP_MIN } from "@/lib/config";
import type { EstadoCita } from "@/lib/models/shared";
import type { Pet } from "@/lib/models/pet";
import {
  newAppointmentSchema,
  updateEstadoSchema,
} from "@/lib/validation/appointment";
import type { FormState } from "@/lib/types/forms";

function fieldErrorsOf(error: z.ZodError): FormState {
  return {
    ok: false,
    fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[]>,
  };
}

/** R11 — Agendar cita. */
export async function createAppointment(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const motivo = formData.get("motivo");
  const parsed = newAppointmentSchema.safeParse({
    ownerId: formData.get("ownerId"),
    petId: formData.get("petId"),
    vetId: formData.get("vetId"),
    serviceId: formData.get("serviceId"),
    fechaHora: formData.get("fechaHora"),
    motivo: typeof motivo === "string" && motivo.trim() ? motivo.trim() : undefined,
  });
  if (!parsed.success) return fieldErrorsOf(parsed.error);
  const input = parsed.data;

  const ownerId = new ObjectId(input.ownerId);
  const petId = new ObjectId(input.petId);
  const vetId = new ObjectId(input.vetId);
  const serviceId = new ObjectId(input.serviceId);

  const [owner, vet, service] = await Promise.all([
    getOwnerById(ownerId),
    getVetById(vetId),
    getServiceById(serviceId),
  ]);
  if (!owner) {
    return { ok: false, fieldErrors: { ownerId: ["El dueño no existe"] } };
  }
  if (!vet) {
    return { ok: false, fieldErrors: { vetId: ["El veterinario no existe"] } };
  }
  if (!service || service.activo === false) {
    return {
      ok: false,
      fieldErrors: { serviceId: ["El servicio no existe o está inactivo"] },
    };
  }

  const db = await getDb();
  const pet = await db.collection<Pet>("pets").findOne({ _id: petId });
  if (!pet || !pet.ownerId.equals(owner._id)) {
    return {
      ok: false,
      fieldErrors: { petId: ["La mascota no existe o no pertenece a ese dueño"] },
    };
  }

  const [dateISO, time] = input.fechaHora.split("T");
  const start = localToUtc(dateISO, time.slice(0, 5), CLINIC_TZ);

  // Tolerancia de un paso de grilla hacia atrás para walk-ins registrados
  // recién comenzado el turno.
  if (start.getTime() < Date.now() - SLOT_STEP_MIN * 60_000) {
    return {
      ok: false,
      fieldErrors: { fechaHora: ["No se puede agendar en el pasado"] },
    };
  }

  // Re-validación de disponibilidad inmediatamente antes de insertar
  // el horario del vet debe seguir libre y la mascota no puede tener dos
  // turnos activos solapados, aunque sea con otro veterinario.
  const [vetLibre, mascotaOcupada] = await Promise.all([
    canBook(vet, start, service.duracionMin, dateISO),
    petHasOverlap(petId, start, service.duracionMin),
  ]);
  if (!vetLibre) {
    return {
      ok: false,
      fieldErrors: {
        fechaHora: ["Ese horario ya no está disponible para el veterinario"],
      },
    };
  }
  if (mascotaOcupada) {
    return {
      ok: false,
      fieldErrors: {
        petId: ["La mascota ya tiene un turno que se solapa con ese horario"],
      },
    };
  }

  await db.collection("appointments").insertOne({
    _id: new ObjectId(),
    ownerId: owner._id,
    petId: pet._id,
    vetId: vet._id,
    serviceId: service._id,
    fechaHora: start,
    motivo: input.motivo,
    estado: "pendiente",
    createdAt: new Date(),
  });

  revalidatePath("/dashboard");
  revalidatePath("/agenda");
  revalidatePath(`/duenos/${owner._id.toHexString()}`);
  return { ok: true };
}

/** Transiciones válidas del ciclo de vida (spec §1.1). */
const TRANSICIONES: Record<EstadoCita, EstadoCita[]> = {
  pendiente: ["confirmada", "cancelada"],
  confirmada: ["completada", "cancelada"],
  completada: [],
  cancelada: [],
};

/** R12 — Cambiar estado de una cita (con optimistic UI en el cliente). */
export async function updateAppointmentEstado(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = updateEstadoSchema.safeParse({
    id: formData.get("id"),
    estado: formData.get("estado"),
  });
  if (!parsed.success) return fieldErrorsOf(parsed.error);

  const id = new ObjectId(parsed.data.id);
  const cita = await getAppointmentById(id);
  if (!cita) {
    return { ok: false, message: "La cita no existe" };
  }
  const destino = parsed.data.estado as EstadoCita;
  if (!TRANSICIONES[cita.estado].includes(destino)) {
    return {
      ok: false,
      message: `No se puede pasar de "${cita.estado}" a "${destino}"`,
    };
  }

  const db = await getDb();
  await db
    .collection("appointments")
    .updateOne({ _id: id }, { $set: { estado: destino } });

  revalidatePath("/dashboard");
  revalidatePath("/agenda");
  revalidatePath(`/duenos/${cita.ownerId.toHexString()}`);
  return { ok: true };
}
