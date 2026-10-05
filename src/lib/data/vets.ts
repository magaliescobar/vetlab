import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { ObjectId } from "mongodb";
import { getDb } from "../db";
import type { Vet } from "../models/vet";
import { serialize, type Serialized } from "../models/serialized";

export const getVets = cache(async function getVets(): Promise<Vet[]> {
  const db = await getDb();
  return db.collection<Vet>("vets").find().sort({ nombre: 1 }).toArray();
});

export const getVetById = cache(async function getVetById(
  id: ObjectId,
): Promise<Vet | null> {
  const db = await getDb();
  return db.collection<Vet>("vets").findOne({ _id: id });
});

export async function getVetsSerialized(): Promise<Serialized<Vet[]>> {
  return serialize(await getVets());
}

/**
 * R04: versión cacheada en el Data Cache con tag "vets" (revalidate 1h).
 * Devuelve datos serializados porque unstable_cache persiste el resultado como JSON.
 */
export const getVetsCached = unstable_cache(
  async (): Promise<Serialized<Vet[]>> => getVetsSerialized(),
  ["vets"],
  { revalidate: 3600, tags: ["vets"] },
);
