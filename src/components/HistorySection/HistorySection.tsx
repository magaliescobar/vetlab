import { ObjectId } from "mongodb";
import { getAppointmentsByOwner } from "@/lib/data/appointments";
import { sleep } from "@/lib/utils";
import { formatFecha, formatHora } from "@/lib/format";
import { EmptyState } from "../EmptyState/EmptyState";
import { Badge } from "../Badge/Badge";
import styles from "./HistorySection.module.css";

/** Sección lenta e independiente del perfil (R08): streamea dentro de Suspense. */
export async function HistorySection({ ownerId }: { ownerId: string }) {
  await sleep(Number(process.env.SIMULATE_LATENCY_MS ?? 0));
  const citas = await getAppointmentsByOwner(new ObjectId(ownerId));

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Historial de citas</h2>
      {citas.length === 0 ? (
        <EmptyState title="Sin citas registradas" />
      ) : (
        <ul className={styles.list}>
          {citas.map((cita) => (
            <li key={cita._id} className={styles.item}>
              <span className={styles.fecha}>
                {formatFecha(cita.fechaHora)} · {formatHora(cita.fechaHora)}
              </span>
              <span className={styles.detalle}>
                {cita.pet.nombre} — {cita.service.nombre} con{" "}
                {cita.vet.nombre}
                {cita.motivo ? ` · ${cita.motivo}` : ""}
              </span>
              <Badge estado={cita.estado} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
