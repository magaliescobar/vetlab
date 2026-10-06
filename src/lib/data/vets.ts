import "server-only";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
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
 * R04: versión cacheada con "use cache" y tag "vets" (cacheLife "hours" ≈ 1h).
 * Devuelve datos serializados: la cache persiste el resultado como JSON.
 */
export async function getVetsCached(): Promise<Serialized<Vet[]>> {
  "use cache";
  cacheLife("hours");
  cacheTag("vets");
  return getVetsSerialized();
}
