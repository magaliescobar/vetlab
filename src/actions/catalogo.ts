"use server";

import { revalidatePath, updateTag } from "next/cache";
import { MongoServerError, ObjectId } from "mongodb";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { getVetById } from "@/lib/data/vets";
import { getServiceById } from "@/lib/data/services";
import { vetCreateSchema, vetUpdateSchema } from "@/lib/validation/vet";
import {
  serviceCreateSchema,
  serviceUpdateSchema,
} from "@/lib/validation/service";
import type { Vet } from "@/lib/models/vet";
import type { Service } from "@/lib/models/service";
import type { FormState } from "@/lib/types/forms";
import { auth } from "@/auth";

const NOT_ADMIN: FormState = {
  ok: false,
  message: "No autorizado: se requiere rol admin.",
};

async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "admin";
}

const optional = (v: FormDataEntryValue | null) =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

/** Slug legible y único (índice unique en services.slug). */
function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


// Alta de veterinario
export async function createVet (
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (!(await isAdmin())) return NOT_ADMIN;
  const parsed =  vetCreateSchema.safeParse({
    nombre: formData.get("nombre"),
    especialidad: formData.get("especialidad"),
    bio: optional(formData.get("bio")),
    horarios: optional(formData.get("horarios")),
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
  const { nombre, especialidad, bio, horarios } = parsed.data;

  const db = await getDb();
  const vet: Vet = {
    _id: new ObjectId(),
    nombre,
    especialidad,
    bio,
    horarios: horarios ?? {},
  };
  await db.collection<Vet>("vets").insertOne(vet);

  updateTag("vets");
  revalidatePath("/veterinarios");
  return { ok: true };
}

/** R05 — Editar un veterinario e invalidar el cache del directorio. */
export async function updateVet(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await isAdmin())) return NOT_ADMIN;
  const parsed = vetUpdateSchema.safeParse({
    id: formData.get("id"),
    nombre: formData.get("nombre"),
    especialidad: formData.get("especialidad"),
    bio: optional(formData.get("bio")),
    horarios: optional(formData.get("horarios")),
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
  const { id, nombre, especialidad, bio, horarios } = parsed.data;

  const _id = new ObjectId(id);
  const vet = await getVetById(_id);
  if (!vet) {
    return { ok: false, message: "El veterinario no existe" };
  }

  const db = await getDb();
  await db
    .collection<Vet>("vets")
    .updateOne(
      { _id },
      {
        $set: {
          nombre,
          especialidad,
          bio,
          ...(horarios !== undefined ? { horarios } : {}),
        },
      },
    );

  // updateTag: expira el tag al instante (solo Server Actions) la próxima
  // carga de /veterinarios espera datos frescos. revalidatePath cubre el
  // Full Route Cache de la página.
  updateTag("vets");
  revalidatePath("/veterinarios");
  return { ok: true };
}

// Alta de servicio
export async function createService(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await isAdmin())) return NOT_ADMIN;
  const parsed = serviceCreateSchema.safeParse({
    nombre: formData.get("nombre"),
    descripcion: optional(formData.get("descripcion")),
    duracionMin: formData.get("duracionMin"),
    precio: formData.get("precio"),
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
  const { nombre, descripcion, duracionMin, precio } = parsed.data;

  const db = await getDb();
  const service: Service = {
    _id: new ObjectId(),
    slug: slugify(nombre),
    nombre,
    descripcion: descripcion ?? "",
    duracionMin,
    precio,
    activo: true,
  };
  try {
    await db.collection<Service>("services").insertOne(service);
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return {
        ok: false,
        fieldErrors: { nombre: ["Ya existe un servicio con ese nombre"] },
      };
    }
    throw error;
  }

  updateTag("services");
  revalidatePath("/servicios");
  return { ok: true };
}

/** Editar un servicio e invalidar el catálogo cacheado. */
export async function updateService(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await isAdmin())) return NOT_ADMIN;
  const parsed = serviceUpdateSchema.safeParse({
    id: formData.get("id"),
    nombre: formData.get("nombre"),
    descripcion: optional(formData.get("descripcion")),
    duracionMin: formData.get("duracionMin"),
    precio: formData.get("precio"),
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
  const { id, nombre, descripcion, duracionMin, precio } = parsed.data;
  const activo = formData.get("activo") === "on";

  const _id = new ObjectId(id);
  console.log("Updating service with ID:", _id);
  const existing = await getServiceById(_id);
  if (!existing) {
    return { ok: false, message: "El servicio no existe" };
  }

  const db = await getDb();
  await db.collection<Service>("services").updateOne(
    { _id },
    {
      $set: {
        nombre,
        descripcion: descripcion ?? "",
        duracionMin,
        precio,
        activo,
      },
    },
  );

  updateTag("services");
  revalidatePath("/servicios");
  return { ok: true };
}
