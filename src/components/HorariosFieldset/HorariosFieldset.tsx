"use client";

import { useState } from "react";
import type { DiaSemana, Horarios } from "@/lib/models/shared";
import { Button } from "../Button/Button";
import styles from "./HorariosFieldset.module.css";

const DIAS: { value: DiaSemana; label: string }[] = [
  { value: "lun", label: "Lunes" },
  { value: "mar", label: "Martes" },
  { value: "mie", label: "Miércoles" },
  { value: "jue", label: "Jueves" },
  { value: "vie", label: "Viernes" },
  { value: "sab", label: "Sábado" },
  { value: "dom", label: "Domingo" },
];

const FRANJA = Array.from(
  { length: 12 },
  (_, i) => `${String(i + 8).padStart(2, "0")}:00`,
);

interface FranjaRow {
  dia: DiaSemana;
  desde: string;
  hasta: string;
}

const nuevaFranja = (): FranjaRow => ({
  dia: "lun",
  desde: "09:00",
  hasta: "13:00",
});

function toRows(horarios: Horarios | undefined): FranjaRow[] {
  if (!horarios) return [nuevaFranja()];
  const rows = DIAS.flatMap((d) =>
    (horarios[d.value] ?? []).map((f) => ({
      dia: d.value,
      desde: f.desde,
      hasta: f.hasta,
    })),
  );
  return rows.length ? rows : [nuevaFranja()];
}

/**
 * Franjas dinámicas (día, desde, hasta) agrupadas por día. Serializa el
 * Horarios resultante como JSON en el hidden input name="horarios".
 * `initial` precarga las franjas al editar un vet existente.
 */
export function HorariosFieldset({
  initial,
  error,
}: {
  initial?: Horarios;
  error?: string[];
}) {
  const [franjas, setFranjas] = useState<FranjaRow[]>(() => toRows(initial));

  const setFranja = (i: number, patch: Partial<FranjaRow>) =>
    setFranjas((prev) => prev.map((f, j) => (j === i ? { ...f, ...patch } : f)));

  const horarios = franjas.reduce<Horarios>((acc, f) => {
    (acc[f.dia] ??= []).push({ desde: f.desde, hasta: f.hasta });
    return acc;
  }, {});

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>Horarios de atención</legend>
      <input type="hidden" name="horarios" value={JSON.stringify(horarios)} />
      {franjas.map((f, i) => (
        <div className={styles.row} key={i}>
          <legend className={styles.legend}>Día</legend>
          <select
            id={`horario-dia-${i}`}
            aria-label="Día"
            value={f.dia}
            onChange={(e) =>
              setFranja(i, { dia: e.target.value as DiaSemana })
            }
            className={styles.select}
          >
            {DIAS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <legend className={styles.legend}>Desde</legend>
          <select
            id={`horario-desde-${i}`}
            aria-label="Desde"
            value={f.desde}
            onChange={(e) => setFranja(i, { desde: e.target.value })}
            className={styles.select}
          >
            {FRANJA.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <legend className={styles.legend}>Hasta</legend>
          <select
            id={`horario-hasta-${i}`}
            aria-label="Hasta"
            value={f.hasta}
            onChange={(e) => setFranja(i, { hasta: e.target.value })}
            className={styles.select}
          >
            {FRANJA.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            className={styles.removeBtn}
            onClick={() =>
              setFranjas((prev) => prev.filter((_, j) => j !== i))
            }
          >
            - Quitar franja
          </Button>
        </div>
      ))}
      <Button
        variant="secondary"
        className={styles.addBtn}
        onClick={() => setFranjas((prev) => [...prev, nuevaFranja()])}
      >
        + Agregar franja
      </Button>
      {(error ?? []).map((m) => (
        <p key={m} className={styles.formError} role="alert">
          {m}
        </p>
      ))}
    </fieldset>
  );
}
