import type { EstadoCita } from "@/lib/models/shared";
import styles from "./StatusCounters.module.css";

const ITEMS: { key: EstadoCita; label: string; className: string }[] = [
  { key: "pendiente", label: "Pendientes", className: styles.pendiente },
  { key: "confirmada", label: "Confirmadas", className: styles.confirmada },
  { key: "completada", label: "Completadas", className: styles.completada },
  { key: "cancelada", label: "Canceladas", className: styles.cancelada },
];

export function StatusCounters({
  counts,
  total,
}: {
  counts: Record<EstadoCita, number>;
  total: number;
}) {
  return (
    <div className={styles.grid}>
      {ITEMS.map((item) => (
        <div key={item.key} className={styles.counter}>
          <span className={item.className}>{counts[item.key]}</span>
          <span className={styles.label}>{item.label}</span>
        </div>
      ))}
      <div className={styles.counter}>
        <span className={styles.total}>{total}</span>
        <span className={styles.label}>Total del día</span>
      </div>
    </div>
  );
}
