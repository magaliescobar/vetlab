"use client";

import type { AppointmentView } from "@/lib/models/views";
import type { Serialized } from "@/lib/models/serialized";
import { formatFecha, formatHora } from "@/lib/format";
import { Dialog } from "../Dialog/Dialog";
import { AppointmentStatusActions } from "../AppointmentStatusActions/AppointmentStatusActions";
import styles from "./AppointmentDetailDialog.module.css";

/** Detalle de la cita clickeada en el calendario + acciones de estado (R12). */
export function AppointmentDetailDialog({
  cita,
  onClose,
  onChanged,
}: {
  cita: Serialized<AppointmentView> | null;
  onClose: () => void;
  /** Refresca el feed de citas y los slots tras un cambio de estado (R12). */
  onChanged?: () => void;
}) {
  return (
    <Dialog open={cita !== null} onClose={onClose} title="Detalle de la cita">
      {cita ? (
        <div className={styles.detalle}>
          <dl className={styles.datos}>
            <div>
              <dt>Fecha y hora</dt>
              <dd>
                {formatFecha(cita.fechaHora)} · {formatHora(cita.fechaHora)}
              </dd>
            </div>
            <div>
              <dt>Mascota</dt>
              <dd>
                {cita.pet.nombre} ({cita.pet.especie})
              </dd>
            </div>
            <div>
              <dt>Dueño</dt>
              <dd>
                {cita.owner.nombre} {cita.owner.apellido}
              </dd>
            </div>
            <div>
              <dt>Veterinario</dt>
              <dd>{cita.vet.nombre}</dd>
            </div>
            <div>
              <dt>Servicio</dt>
              <dd>
                {cita.service.nombre} ({cita.service.duracionMin} min)
              </dd>
            </div>
            {cita.motivo ? (
              <div>
                <dt>Motivo</dt>
                <dd>{cita.motivo}</dd>
              </div>
            ) : null}
          </dl>
          <div className={styles.acciones}>
            <AppointmentStatusActions
              id={cita._id}
              estado={cita.estado}
              inTable={false}
              onChanged={(next) => {
                onChanged?.();
                if (next === "completada" || next === "cancelada") onClose();
              }}
            />
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
