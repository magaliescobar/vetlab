import type { DiaSemana, Horarios } from "@/lib/models/shared";
import styles from "./VetHorarios.module.css";

const DIAS: { value: DiaSemana; label: string }[] = [
  { value: "lun", label: "Lunes" },
  { value: "mar", label: "Martes" },
  { value: "mie", label: "Miércoles" },
  { value: "jue", label: "Jueves" },
  { value: "vie", label: "Viernes" },
  { value: "sab", label: "Sábado" },
  { value: "dom", label: "Domingo" },
];

/** Horarios de atención semanales del vet (read-only). */
export function VetHorarios({ horarios }: { horarios: Horarios }) {
  return (
    <dl className={styles.grid}>
      {DIAS.map((d) => {
        const franjas = horarios[d.value] ?? [];
        return (
          <div key={d.value} className={styles.row}>
            <dt className={styles.dia}>{d.label}</dt>
            <dd className={styles.franjas}>
              {franjas.length === 0 ? (
                <span className={styles.libre}>No atiende</span>
              ) : (
                franjas.map((f) => (
                  <span key={`${f.desde}-${f.hasta}`} className={styles.franja}>
                    {f.desde}–{f.hasta}
                  </span>
                ))
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
