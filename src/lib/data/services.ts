import "server-only";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import type { ObjectId } from "mongodb";
import { getDb } from "../db";
import type { Service } from "../models/service";
import { serialize, type Serialized } from "../models/serialized";

export const getServices = cache(async function getServices(): Promise<
  Service[]
> {
  const db = await getDb();
  return db.collection<Service>("services").find().sort({ nombre: 1 }).toArray();
});

export const getServiceById = cache(async function getServiceById(
  id: ObjectId,
): Promise<Service | null> {
  const db = await getDb();
  return db.collection<Service>("services").findOne({ _id: id });
});

export async function getServicesSerialized(): Promise<Serialized<Service[]>> {
  return serialize(await getServices());
}

/** Versión cacheada con tag "services" (catálogo, cambia poco). */
export async function getServicesCached(): Promise<Serialized<Service[]>> {
  "use cache";
  cacheLife("hours");
  cacheTag("services");
  return getServicesSerialized();
}
