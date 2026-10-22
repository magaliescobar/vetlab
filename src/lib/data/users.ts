import "server-only";
import { getDb } from "../db";
import type { User } from "../models/user";

export async function getUser(email: string): Promise<User | null> {
  const db = await getDb();
  return db.collection<User>("users").findOne({ email });
}
