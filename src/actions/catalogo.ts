"use server";

import { revalidatePath, updateTag } from "next/cache";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { getVetById } from "@/lib/data/vets";
import { vetUpdateSchema } from "@/lib/validation/vet";
import type { Vet } from "@/lib/models/vet";
import type { FormState } from "@/lib/types/forms";

const optional = (v: FormDataEntryValue | null) =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

/** R05 — Editar un veterinario e invalidar el cache del directorio. */
export async function updateVet(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = vetUpdateSchema.safeParse({
    id: formData.get("id"),
    nombre: formData.get("nombre"),
    especialidad: formData.get("especialidad"),
    bio: optional(formData.get("bio")),
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
  const { id, nombre, especialidad, bio } = parsed.data;

  const _id = new ObjectId(id);
  const vet = await getVetById(_id);
  if (!vet) {
    return { ok: false, message: "El veterinario no existe" };
  }

  const db = await getDb();
  await db
    .collection<Vet>("vets")
    .updateOne({ _id }, { $set: { nombre, especialidad, bio } });

  // updateTag: expira el tag al instante (solo Server Actions) → la próxima
  // carga de /veterinarios espera datos frescos. revalidatePath cubre el
  // Full Route Cache de la página.
  updateTag("vets");
  revalidatePath("/veterinarios");
  return { ok: true };
}
