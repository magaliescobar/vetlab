import { CLINIC_TZ } from "./config";

const fmtHora = new Intl.DateTimeFormat("es-UY", {
  timeZone: CLINIC_TZ, hour: "2-digit", minute: "2-digit", hour12: false,
});

const fmtFecha = new Intl.DateTimeFormat("es-UY", {
  timeZone: CLINIC_TZ, day: "numeric", month: "short", year: "numeric",
});

const fmtFechaDia = new Intl.DateTimeFormat("es-UY", {
  timeZone: CLINIC_TZ, weekday: "short", day: "numeric", month: "short", year: "numeric",
});

const fmtPrecio = new Intl.NumberFormat("es-UY", {
  style: "currency", currency: "UYU", maximumFractionDigits: 0,
});

const toDate = (d: Date | string) => (typeof d === "string" ? new Date(d) : d);

export function formatHora(d: Date | string): string {
  return fmtHora.format(toDate(d));
}

export function formatFecha(d: Date | string): string {
  return fmtFecha.format(toDate(d));
}

export function formatFechaDia(d: Date | string): string {
  return fmtFechaDia.format(toDate(d));
}

export function formatPrecio(n: number): string {
  return fmtPrecio.format(n);
}
