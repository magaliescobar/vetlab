import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/models/user";

declare module "next-auth" {
  interface User {
    role?: UserRole;
  }
  interface Session {
    user: {
      role?: UserRole;
    } & DefaultSession["user"];
  }
}
