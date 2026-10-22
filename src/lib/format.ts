import { CLINIC_TZ } from "./config";

const fmtHora = new Intl.DateTimeFormat("es-UY", {
  timeZone: CLINIC_TZ, hour: "2-digit", minute: "2-digit", hour12: false,
});

const fmtFecha = new Intl.DateTimeFormat("es-UY", {
  timeZone: CLINIC_TZ, day: "2-digit", month: "2-digit", year: "numeric",
});

const fmtDia = new Intl.DateTimeFormat("es-UY", {
  timeZone: CLINIC_TZ, weekday: "short",
});

const fmtPrecio = new Intl.NumberFormat("es-UY", {
  style: "currency", currency: "UYU", maximumFractionDigits: 0,
});

const toDate = (d: Date | string) => (typeof d === "string" ? new Date(d) : d);

export function formatHora(d: Date | string): string {
  return fmtHora.format(toDate(d));
}

export function formatFecha(d: Date | string): string {
  const parts = fmtFecha.formatToParts(toDate(d));
  const g = (t: string) => parts.find((p) => p.type === t)?.value;
  return `${g("day")}-${g("month")}-${g("year")}`;
}

export function formatFechaDia(d: Date | string): string {
  return `${fmtDia.format(toDate(d))} ${formatFecha(d)}`;
}

export function formatFechaIso(iso: string): string {
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}-${m}-${y}`;
}

export function formatPrecio(n: number): string {
  return fmtPrecio.format(n);
}
