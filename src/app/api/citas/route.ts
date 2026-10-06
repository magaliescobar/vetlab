import { z } from "zod";
import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getAppointmentsInRange } from "@/lib/data/appointments";
import { objectIdString } from "@/lib/validation/appointment";

const querySchema = z.object({
  from: z.iso.datetime({ offset: true }).or(z.iso.datetime()),
  to: z.iso.datetime({ offset: true }).or(z.iso.datetime()),
  vetId: objectIdString.optional(),
});

/**
 * Feed de citas para el calendario de /agenda (extensión documentada en README).
 * GET /api/citas?from=<ISO>&to=<ISO>[&vetId=] → Serialized<AppointmentView>[]
 */
export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return Response.json(
      { error: "Parámetros inválidos: se requiere from y to en ISO" },
      { status: 400 },
    );
  }

  const citas = await getAppointmentsInRange(
    new Date(parsed.data.from),
    new Date(parsed.data.to),
    parsed.data.vetId ? new ObjectId(parsed.data.vetId) : undefined,
  );
  return Response.json(citas);
}
