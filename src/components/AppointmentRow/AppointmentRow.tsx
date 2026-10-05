import Link from "next/link";
import type { AppointmentView } from "@/lib/models/views";
import type { Serialized } from "@/lib/models/serialized";
import { formatHora } from "@/lib/format";
import { AppointmentStatusActions } from "../AppointmentStatusActions/AppointmentStatusActions";
import styles from "./AppointmentRow.module.css";

export function AppointmentRow({
  cita,
}: {
  cita: Serialized<AppointmentView>;
}) {
  return (
    <tr className={styles.row}>
      <td className={styles.hora}>{formatHora(cita.fechaHora)}</td>
      <td>
        <span className={styles.principal}>{cita.pet.nombre}</span>
        <span className={styles.secundario}>
          {cita.pet.especie}
          {cita.motivo ? ` · ${cita.motivo}` : ""}
        </span>
      </td>
      <td>
        <Link href={`/duenos/${cita.owner._id}`} className={styles.link}>
          {cita.owner.nombre} {cita.owner.apellido}
        </Link>
      </td>
      <td>{cita.vet.nombre}</td>
      <td>{cita.service.nombre}</td>
      <AppointmentStatusActions id={cita._id} estado={cita.estado} />
    </tr>
  );
}
