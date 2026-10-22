"use client";

import type { Vet } from "@/lib/models/vet";
import type { Serialized } from "@/lib/models/serialized";
import type { EstadoCita } from "@/lib/models/shared";
import styles from "./AgendaFilters.module.css";

const ESTADOS: { value: EstadoCita | ""; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmada", label: "Confirmada" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

export function AgendaFilters({
  vets,
  vetId,
  estado,
  onVetChange,
  onEstadoChange,
}: {
  vets: Serialized<Vet[]>;
  vetId: string;
  estado: EstadoCita | "";
  onVetChange: (v: string) => void;
  onEstadoChange: (v: EstadoCita | "") => void;
}) {
  return (
    <div className={styles.filters}>
      <label className={styles.label}>
        Veterinario
        <select
          id="agenda-vet"
          value={vetId}
          onChange={(e) => onVetChange(e.target.value)}
          className={styles.select}
        >
          <option value="">Todos</option>
          {vets.map((v) => (
            <option key={v._id} value={v._id}>
              {v.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.label}>
        Estado
        <select
          id="agenda-estado"
          value={estado}
          onChange={(e) => onEstadoChange(e.target.value as EstadoCita | "")}
          className={styles.select}
        >
          {ESTADOS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
