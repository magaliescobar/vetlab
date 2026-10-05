import type { AppointmentView } from "@/lib/models/views";
import type { Serialized } from "@/lib/models/serialized";
import { EmptyState } from "../EmptyState/EmptyState";
import { AppointmentRow } from "../AppointmentRow/AppointmentRow";
import styles from "./AppointmentTable.module.css";

export function AppointmentTable({
  citas,
}: {
  citas: Serialized<AppointmentView[]>;
}) {
  if (citas.length === 0) {
    return (
      <EmptyState
        title="No hay citas"
        description="No se encontraron turnos para los filtros seleccionados."
      />
    );
  }
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Hora</th>
            <th>Mascota</th>
            <th>Dueño</th>
            <th>Veterinario</th>
            <th>Servicio</th>
            <th>Estado</th>
            <th className={styles.actionsHeader}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {citas.map((cita) => (
            <AppointmentRow key={cita._id} cita={cita} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
