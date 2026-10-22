import "server-only";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { ObjectId } from "mongodb";
import { getDb } from "../db";
import type { Pet } from "../models/pet";
import { serialize, type Serialized } from "../models/serialized";

export const getPetsByOwner = cache(async function getPetsByOwner(
  ownerId: ObjectId,
): Promise<Pet[]> {
  const db = await getDb();
  return db
    .collection<Pet>("pets")
    .find({ ownerId })
    .sort({ nombre: 1 })
    .toArray();
});

export async function getPetsByOwnerSerialized(
  ownerId: ObjectId,
): Promise<Serialized<Pet[]>> {
  return serialize(await getPetsByOwner(ownerId));
}

/**
 * Versión cacheada por owner: `owner-pets:${ownerId}` invalida solo las
 * mascotas de ese dueño; "pets" cubre el catálogo global.
 */
export async function getPetsByOwnerCached(
  ownerId: string,
): Promise<Serialized<Pet[]>> {
  "use cache";
  cacheLife("hours");
  cacheTag("pets", `owner-pets:${ownerId}`);
  return getPetsByOwnerSerialized(new ObjectId(ownerId));
}

export async function getPetsSerialized(): Promise<Serialized<Pet[]>> {
  const db = await getDb();
  const pets = await db.collection<Pet>("pets").find().sort({ nombre: 1 }).toArray();
  return serialize(pets);
}

/** Versión cacheada con tag "pets" (catálogo, cambia poco). */
export async function getPetsCached(): Promise<Serialized<Pet[]>> {
  "use cache";
  cacheLife("hours");
  cacheTag("pets");
  return getPetsSerialized();
}
