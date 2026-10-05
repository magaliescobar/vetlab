import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import type { NextRequest } from "next/server";

const bodySchema = z
  .object({
    tag: z.string().min(1).optional(),
    path: z.string().min(1).optional(),
  })
  .refine((v) => v.tag || v.path, { message: "Se requiere tag o path" });

/**
 * R05 — Revalidación on-demand vía HTTP.
 * POST /api/revalidate { "tag"?: string, "path"?: string }
 * Header obligatorio: x-revalidate-secret.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ revalidated: false, error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ revalidated: false, error: "JSON inválido" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { revalidated: false, error: "Se requiere tag o path válidos" },
      { status: 400 },
    );
  }

  // En Route Handlers solo se puede usar revalidateTag (updateTag es exclusivo
  // de Server Actions). Perfil "max": stale-while-revalidate.
  if (parsed.data.tag) revalidateTag(parsed.data.tag, "max");
  if (parsed.data.path) revalidatePath(parsed.data.path);

  return Response.json({ revalidated: true, now: Date.now() });
}
