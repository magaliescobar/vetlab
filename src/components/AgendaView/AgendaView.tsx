"use client";

import { useMemo, useReducer, useState } from "react";
import type { Owner } from "@/lib/models/owner";
import type { Pet } from "@/lib/models/pet";
import type { Service } from "@/lib/models/service";
import type { Vet } from "@/lib/models/vet";
import type { Serialized } from "@/lib/models/serialized";
import type { AppointmentView } from "@/lib/models/views";
import type { EstadoCita } from "@/lib/models/shared";
import { clinicHoursRange } from "@/lib/availability";
import { AgendaFilters } from "../AgendaFilters/AgendaFilters";
import { CalendarWidget } from "../CalendarWidget/CalendarWidget";
import { SlotPicker } from "../SlotPicker/SlotPicker";
import { BookingDialog } from "../BookingDialog/BookingDialog";
import { AppointmentDetailDialog } from "../AppointmentDetailDialog/AppointmentDetailDialog";
import styles from "./AgendaView.module.css";

interface Props {
  vets: Serialized<Vet[]>;
  services: Serialized<Service[]>;
  owners: Serialized<Owner[]>;
  pets: Serialized<Pet[]>;
}

export interface BookingTarget {
  vetId: string;
  /** "YYYY-MM-DDTHH:mm" en hora local de la clínica (formato del form). */
  fechaHora: string;
}

/**
 * R09 — Host CSR: todo el estado de UI vive acá (filtros, fecha visible del
 * calendario, diálogos) y ninguna interacción navega ni recarga la página.
 */
export function AgendaView({ vets, services, owners, pets }: Props) {
  // Al agendar o cambiar el estado de una cita, bump de refreshKey fuerza el
  // refetch del feed del calendario y de los slots (reemplaza invalidateQueries).
  const [refreshKey, refreshAgenda] = useReducer((x: number) => x + 1, 0);
  const [vetId, setVetId] = useState<string>("");
  const [estado, setEstado] = useState<EstadoCita | "">("");
  const [calDateISO, setCalDateISO] = useState<string>("");
  const [selected, setSelected] = useState<Serialized<AppointmentView> | null>(
    null,
  );
  const [booking, setBooking] = useState<BookingTarget | null>(null);

  // La grilla horaria del calendario cubre los horarios de todos los vets
  // (SVAR recorta por defecto a 8–18 h y los turnos de la noche no se ven).
  const { startHour, endHour } = useMemo(() => clinicHoursRange(vets), [vets]);

  return (
    <>
      <AgendaFilters
        vets={vets}
        vetId={vetId}
        estado={estado}
        onVetChange={setVetId}
        onEstadoChange={setEstado}
      />
      <div className={styles.layout}>
        <div className={styles.calendar}>
          <CalendarWidget
            vetId={vetId}
            estado={estado}
            startHour={startHour}
            endHour={endHour}
            refreshKey={refreshKey}
            onDateChange={setCalDateISO}
            onSelect={setSelected}
          />
        </div>
        <aside className={styles.sidebar}>
          <SlotPicker
            vetId={vetId}
            vets={vets}
            dateISO={calDateISO}
            refreshKey={refreshKey}
            onPick={(fechaHora) =>
              setBooking({ vetId, fechaHora })
            }
          />
        </aside>
      </div>
      <AppointmentDetailDialog
        cita={selected}
        onClose={() => setSelected(null)}
        onChanged={refreshAgenda}
      />
      <BookingDialog
        target={booking}
        owners={owners}
        pets={pets}
        vets={vets}
        services={services}
        onClose={() => setBooking(null)}
        onBooked={refreshAgenda}
      />
    </>
  );
}
