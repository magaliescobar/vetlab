import type { EstadoCita } from "@/lib/models/shared";
import { Button } from "../Button/Button";
import styles from "./DashboardFilters.module.css";

const OPCIONES: { value: EstadoCita | ""; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmada", label: "Confirmada" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

/** Filtros del dashboard: la URL es la fuente de verdad (GET + searchParams). */
export function DashboardFilters({
  date,
  estado,
}: {
  date: string;
  estado?: EstadoCita;
}) {
  return (
    <form method="GET" action="/dashboard" className={styles.filters}>
      <label className={styles.label}>
        Fecha
        <input type="date" name="date" defaultValue={date} />
      </label>
      <label className={styles.label}>
        Estado
        <select name="estado" defaultValue={estado ?? ""}>
          {OPCIONES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" variant="secondary">
        Filtrar
      </Button>
    </form>
  );
}
