"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { MongoServerError, ObjectId } from "mongodb";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { ownerWithPetSchema, petSchema } from "@/lib/validation/owner";
import { objectIdString } from "@/lib/validation/appointment";
import type { Owner } from "@/lib/models/owner";
import type { Pet } from "@/lib/models/pet";
import type { FormState } from "@/lib/types/forms";
import { getOwnerById } from "@/lib/data/owners";

const optional = (v: FormDataEntryValue | null) =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

/** R13 — Registrar dueño + primera mascota. */
export async function registerOwnerWithPet(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = ownerWithPetSchema.safeParse({
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    direccion: optional(formData.get("direccion")),
    petNombre: formData.get("petNombre"),
    petEspecie: formData.get("petEspecie"),
    petRaza: optional(formData.get("petRaza")),
    petFechaNacimiento: optional(formData.get("petFechaNacimiento")),
    petPesoKg: optional(formData.get("petPesoKg")),
    petFotoUrl: optional(formData.get("petFotoUrl")),
    petNotas: optional(formData.get("petNotas")),
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<
        string,
        string[]
      >,
    };
  }
  const input = parsed.data;

  const db = await getDb();
  const ownerId = new ObjectId();
  const now = new Date();

  const owner: Owner = {
    _id: ownerId,
    nombre: input.nombre,
    apellido: input.apellido,
    email: input.email.toLowerCase(),
    telefono: input.telefono,
    direccion: input.direccion,
    createdAt: now,
  };

  try {
    await db.collection<Owner>("owners").insertOne(owner);
    try {
      const pet: Pet = {
        _id: new ObjectId(),
        ownerId,
        nombre: input.petNombre,
        especie: input.petEspecie,
        raza: input.petRaza,
        fechaNacimiento: input.petFechaNacimiento
          ? new Date(`${input.petFechaNacimiento}T00:00:00Z`)
          : undefined,
        pesoKg: input.petPesoKg ? Number(input.petPesoKg) : undefined,
        fotoUrl: input.petFotoUrl || undefined,
        notas: input.petNotas,
      };
      await db.collection<Pet>("pets").insertOne(pet);
    } catch (petError) {
      // Sin transacciones en standalone: rollback manual del owner.
      await db.collection("owners").deleteOne({ _id: ownerId });
      throw petError;
    }
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return {
        ok: false,
        fieldErrors: { email: ["Ya existe un dueño con ese email"] },
      };
    }
    throw error;
  }

  // Expira al instante los catálogos cacheados (agenda, perfil de dueño).
  updateTag("owners");
  updateTag("pets");
  redirect(`/duenos/${ownerId.toHexString()}`);
}

/**
 * R13 — Registrar nueva mascota (mismo dueño).
 */
export async function registerNewPet(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = petSchema.extend({ ownerId: objectIdString }).safeParse({
    ownerId: formData.get("ownerId"),
    petNombre: formData.get("petNombre"),
    petEspecie: formData.get("petEspecie"),
    petRaza: optional(formData.get("petRaza")),
    petFechaNacimiento: optional(formData.get("petFechaNacimiento")),
    petPesoKg: optional(formData.get("petPesoKg")),
    petFotoUrl: optional(formData.get("petFotoUrl")),
    petNotas: optional(formData.get("petNotas")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const input = parsed.data;

  const owner = await getOwnerById(new ObjectId(input.ownerId));
  if (!owner) {
    return {
      ok: false,
      fieldErrors: { ownerId: ["Dueño no encontrado"] },
    };
  }

  const db = await getDb();
  const pet: Pet = {
    _id: new ObjectId(),
    ownerId: owner._id,
    nombre: input.petNombre,
    especie: input.petEspecie,
    raza: input.petRaza,
    fechaNacimiento: input.petFechaNacimiento
      ? new Date(`${input.petFechaNacimiento}T00:00:00Z`)
      : undefined,
    pesoKg: input.petPesoKg ? Number(input.petPesoKg) : undefined,
    fotoUrl: input.petFotoUrl,
    notas: input.petNotas,
  };
  await db.collection<Pet>("pets").insertOne(pet);

  // Expira las mascotas cacheadas del perfil del dueño.
  updateTag("pets");
  updateTag(`owner-pets:${input.ownerId}`);
  return { ok: true };
}

/** Editar una mascota existente. */
export async function updatePet(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = petSchema.extend({ id: objectIdString }).safeParse({
    id: formData.get("id"),
    petNombre: formData.get("petNombre"),
    petEspecie: formData.get("petEspecie"),
    petRaza: optional(formData.get("petRaza")),
    petFechaNacimiento: optional(formData.get("petFechaNacimiento")),
    petPesoKg: optional(formData.get("petPesoKg")),
    petFotoUrl: optional(formData.get("petFotoUrl")),
    petNotas: optional(formData.get("petNotas")),
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<
        string,
        string[]
      >,
    };
  }
  const input = parsed.data;

  const _id = new ObjectId(input.id);
  const db = await getDb();
  const existing = await db.collection<Pet>("pets").findOne({ _id });
  if (!existing) {
    return { ok: false, message: "La mascota no existe" };
  }

  await db.collection<Pet>("pets").updateOne(
    { _id },
    {
      $set: {
        nombre: input.petNombre,
        especie: input.petEspecie,
        raza: input.petRaza,
        fechaNacimiento: input.petFechaNacimiento
          ? new Date(`${input.petFechaNacimiento}T00:00:00Z`)
          : undefined,
        pesoKg: input.petPesoKg ? Number(input.petPesoKg) : undefined,
        fotoUrl: input.petFotoUrl || undefined,
        notas: input.petNotas,
      },
    },
  );

  // Expira las mascotas cacheadas del perfil del dueño.
  updateTag("pets");
  updateTag(`owner-pets:${existing.ownerId.toHexString()}`);
  return { ok: true };
}
