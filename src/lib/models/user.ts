import type { Id } from "./shared";

export type UserRole = "admin" | "staff";

export interface User {
  _id: Id;
  nombre: string;
  email: string;
  /** Hash bcrypt — nunca la contraseña en texto plano. */
  password: string;
  role: UserRole;
}
