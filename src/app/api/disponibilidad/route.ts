import { z } from "zod";
import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getVetById } from "@/lib/data/vets";
import { getServiceById } from "@/lib/data/services";
import { getSlots } from "@/lib/data/availability";
import { DEFAULT_SLOT_MIN } from "@/lib/config";
import { objectIdString } from "@/lib/validation/appointment";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  vetId: objectIdString,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  serviceId: objectIdString.optional(),
});

/**
 * R14 — GET /api/disponibilidad?vetId=&date=[&serviceId=]
 * Devuelve Slot[] frescos (sin cache). Sin serviceId usa DEFAULT_SLOT_MIN.
 */
export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return Response.json(
      { error: "Parámetros inválidos: se requiere vetId y date=YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const vet = await getVetById(new ObjectId(parsed.data.vetId));
  if (!vet) {
    return Response.json({ error: "Veterinario no encontrado" }, { status: 404 });
  }

  let durationMin = DEFAULT_SLOT_MIN;
  if (parsed.data.serviceId) {
    const service = await getServiceById(new ObjectId(parsed.data.serviceId));
    if (!service) {
      return Response.json({ error: "Servicio no encontrado" }, { status: 404 });
    }
    durationMin = service.duracionMin;
  }

  const slots = await getSlots(vet, parsed.data.date, durationMin);
  return Response.json(slots);
}
