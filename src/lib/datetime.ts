import { CLINIC_TZ } from "./config";

const pad = (n: number) => String(n).padStart(2, "0");

/** Instante UTC → Date "de pared" con los componentes de hora local de la clínica (para el calendario). */
export function toWallClock(utc: Date, tz: string = CLINIC_TZ): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(utc);
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return new Date(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
}

/** Date "de pared" → "YYYY-MM-DDTHH:mm" (formato de NewAppointmentInput.fechaHora). */
export function toLocalIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Fecha de hoy "YYYY-MM-DD" en la zona de la clínica. */
export function todayISO(tz: string = CLINIC_TZ, now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}
