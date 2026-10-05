import "server-only";
import { cache } from "react";
import type { ObjectId } from "mongodb";
import { getDb } from "../db";
import type { Owner } from "../models/owner";
import { serialize, type Serialized } from "../models/serialized";

export const getOwnerById = cache(async function getOwnerById(
  id: ObjectId,
): Promise<Owner | null> {
  const db = await getDb();
  return db.collection<Owner>("owners").findOne({ _id: id });
});

export async function getOwnerByIdSerialized(
  id: ObjectId,
): Promise<Serialized<Owner> | null> {
  const owner = await getOwnerById(id);
  return owner ? serialize(owner) : null;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SEARCH_FIELDS = ["nombre", "apellido", "email", "telefono"] as const;

export interface OwnerSearchResult {
  owners: Serialized<Owner[]>;
  total: number;
  page: number;
  totalPages: number;
}

/**
 * R07: búsqueda por tokens con $regex case-insensitive.
 * Cada token de `q` debe coincidir con algún campo (AND de ORs).
 * Se usa regex y no el índice de texto porque "$text" solo matchea palabras
 * completas ("mar" no encontraría "María").
 */
export async function searchOwners(
  q: string,
  page: number,
  pageSize = 10,
): Promise<OwnerSearchResult> {
  const db = await getDb();
  const tokens = q.trim().split(/\s+/).filter(Boolean);
  const filter =
    tokens.length > 0
      ? {
          $and: tokens.map((t) => ({
            $or: SEARCH_FIELDS.map((f) => ({
              [f]: { $regex: escapeRegExp(t), $options: "i" },
            })),
          })),
        }
      : {};

  const collection = db.collection<Owner>("owners");
  const total = await collection.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const owners = await collection
    .find(filter)
    .sort({ apellido: 1, nombre: 1 })
    .skip((safePage - 1) * pageSize)
    .limit(pageSize)
    .toArray();

  return { owners: serialize(owners), total, page: safePage, totalPages };
}

export async function getOwnersSerialized(): Promise<Serialized<Owner[]>> {
  const db = await getDb();
  const owners = await db
    .collection<Owner>("owners")
    .find()
    .sort({ apellido: 1, nombre: 1 })
    .toArray();
  return serialize(owners);
}
