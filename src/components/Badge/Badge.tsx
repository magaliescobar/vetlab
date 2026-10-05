import clsx from "clsx";
import type { EstadoCita } from "@/lib/models/shared";
import styles from "./Badge.module.css";

const LABELS: Record<EstadoCita, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
};

export function Badge({ estado }: { estado: EstadoCita }) {
  return (
    <span className={clsx(styles.badge, styles[estado])}>{LABELS[estado]}</span>
  );
}
