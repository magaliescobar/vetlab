import { CLINIC_TZ } from "./config";
import type { DiaSemana, Horarios } from "./models/shared";
import type { Slot } from "./models/views";

export interface Interval { start: Date; end: Date }

const DIAS: DiaSemana[] = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
const MIN = 60_000;

/** Intervalos semiabiertos [start, end): se solapan si a.start < b.end && b.start < a.end. */
export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

export function appointmentInterval(fechaHora: Date, duracionMin: number): Interval {
  return { start: fechaHora, end: new Date(fechaHora.getTime() + duracionMin * MIN) };
}

function tzOffsetMs(utc: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(utc);
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
  return asUtc - Math.floor(utc.getTime() / 1000) * 1000;
}

/** "YYYY-MM-DD" + "HH:mm" (hora local de tz) → instante UTC. "24:00" = medianoche siguiente. */
export function localToUtc(dateISO: string, hhmm: string, tz: string = CLINIC_TZ): Date {
  const [y, m, d] = dateISO.split("-").map(Number);
  const [h, min] = hhmm.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, min);
  return new Date(guess - tzOffsetMs(new Date(guess), tz));
}

export function dayBoundsUtc(dateISO: string, tz: string = CLINIC_TZ): Interval {
  return { start: localToUtc(dateISO, "00:00", tz), end: localToUtc(dateISO, "24:00", tz) };
}

/** Franjas de atención del vet para esa fecha local, ya en UTC. */
export function workingIntervals(horarios: Horarios, dateISO: string, tz: string = CLINIC_TZ): Interval[] {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dia = DIAS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return (horarios[dia] ?? []).map((f) => ({
    start: localToUtc(dateISO, f.desde, tz),
    end: localToUtc(dateISO, f.hasta, tz),
  }));
}

/** Resta los intervalos ocupados a los libres. */
export function subtract(free: Interval[], busy: Interval[]): Interval[] {
  let result = free;
  for (const b of busy) {
    result = result.flatMap((f) => {
      if (!overlaps(f, b)) return [f];
      const out: Interval[] = [];
      if (f.start < b.start) out.push({ start: f.start, end: b.start });
      if (b.end < f.end) out.push({ start: b.end, end: f.end });
      return out;
    });
  }
  return result;
}

/** Inicios posibles de un turno de `durationMin` dentro de `within`, en una grilla de `stepMin`. */
export function generateSlots(within: Interval[], durationMin: number, stepMin: number): Date[] {
  const slots: Date[] = [];
  for (const f of within) {
    for (let t = f.start.getTime(); t + durationMin * MIN <= f.end.getTime(); t += stepMin * MIN) {
      slots.push(new Date(t));
    }
  }
  return slots;
}

/** El candidato entra entero dentro de algún tramo libre (cubre horario del vet + no solapamiento). */
export function fitsIn(free: Interval[], candidate: Interval): boolean {
  return free.some((f) => f.start <= candidate.start && candidate.end <= f.end);
}

/** R14: todos los slots del horario del vet, marcando cuáles están disponibles. */
export function buildSlots(
  working: Interval[], busy: Interval[], durationMin: number, stepMin: number, now: Date,
): Slot[] {
  const free = subtract(working, busy);
  return generateSlots(working, durationMin, stepMin).map((start) => {
    const iv = appointmentInterval(start, durationMin);
    return {
      inicio: start.toISOString(),
      fin: iv.end.toISOString(),
      disponible: start >= now && fitsIn(free, iv),
    };
  });
}
