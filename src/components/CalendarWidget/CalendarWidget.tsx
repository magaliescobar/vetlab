"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Willow } from "@svar-ui/react-calendar";
import type {
  CalendarInstanceApi,
  EventCss,
} from "@svar-ui/react-calendar";
import { Locale } from "@svar-ui/react-core";
import { es as coreEs } from "@svar-ui/core-locales";
import { es as calendarEs } from "@svar-ui/calendar-locales";
// Excepción documentada: el CSS de SVAR se importa solo en este archivo.
import "@svar-ui/react-calendar/all.css";
import type { AppointmentView } from "@/lib/models/views";
import type { Serialized } from "@/lib/models/serialized";
import type { EstadoCita } from "@/lib/models/shared";
import { toLocalIso, toWallClock, wallClockToUtc } from "@/lib/datetime";
import styles from "./CalendarWidget.module.css";

/** Cita serializada con campos propios que viajan dentro del evento SVAR. */
type CitaView = Serialized<AppointmentView>;

const ESTADO_CLASS: Record<EstadoCita, string> = {
  pendiente: styles.estadoPendiente,
  confirmada: styles.estadoConfirmada,
  completada: styles.estadoCompletada,
  cancelada: styles.estadoCancelada,
};

const eventCss: EventCss = (ctx) => {
  const estado = ctx.event.estado;
  return typeof estado === "string" && estado in ESTADO_CLASS
    ? ESTADO_CLASS[estado as EstadoCita]
    : "";
};

async function fetchCitas(from: string, to: string): Promise<CitaView[]> {
  const res = await fetch(`/api/citas?from=${from}&to=${to}`);
  if (!res.ok) throw new Error("No se pudieron cargar las citas");
  return res.json() as Promise<CitaView[]>;
}

const words = { ...coreEs, ...calendarEs };

export function CalendarWidget({
  vetId,
  estado,
  onDateChange,
  onSelect,
}: {
  vetId: string;
  estado: EstadoCita | "";
  onDateChange: (dateISO: string) => void;
  onSelect: (cita: CitaView) => void;
}) {
  // Fecha inicial en "wall clock" (memoizada: props de fecha/vista son
  // reactivos por identidad; una Date nueva por render resetearía la vista).
  const initialDate = useMemo(() => toWallClock(new Date()), []);

  // Rango visible en UTC, inicializado con la semana de initialDate:
  // la emisión inicial de request-data puede ocurrir antes de que api.on
  // registre el handler (carrera) y sin semilla la agenda cargaría vacía.
  const [range, setRange] = useState(() => {
    const from = new Date(initialDate);
    from.setDate(from.getDate() - ((from.getDay() + 6) % 7));
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + 7);
    return {
      from: wallClockToUtc(from).toISOString(),
      to: wallClockToUtc(to).toISOString(),
    };
  });
  const onDateChangeRef = useRef(onDateChange);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onDateChangeRef.current = onDateChange;
    onSelectRef.current = onSelect;
  });
  // Sincroniza el SlotPicker con la fecha inicial (request-data ya lo hace
  // en las navegaciones siguientes).
  useEffect(() => {
    onDateChangeRef.current(toLocalIso(initialDate).slice(0, 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const citasQuery = useQuery({
    queryKey: ["citas", range.from, range.to],
    queryFn: () => fetchCitas(range.from, range.to),
    placeholderData: (prev) => prev,
  });

  const citaById = useMemo(
    () => new Map((citasQuery.data ?? []).map((c) => [c._id, c])),
    [citasQuery.data],
  );

  /** La suscripción vive una vez: el store emite request-data al montar y al navegar. */
  const init = useCallback((api: CalendarInstanceApi) => {
    api.on("request-data", (ev) => {
      // El bus no discrimina por nombre de acción: narrow por forma del payload.
      if (!("startDate" in ev) || !("endDate" in ev) || !("date" in ev)) return;
      setRange({
        from: wallClockToUtc(ev.startDate).toISOString(),
        to: wallClockToUtc(ev.endDate).toISOString(),
      });
      onDateChangeRef.current(toLocalIso(ev.date).slice(0, 10));
    });
  }, []);

  const events = useMemo(
    () =>
      (citasQuery.data ?? [])
        .filter(
          (c) =>
            (!vetId || c.vet._id === vetId) && (!estado || c.estado === estado),
        )
        .map((c) => {
          const start = new Date(c.fechaHora);
          return {
            id: c._id,
            start: toWallClock(start),
            end: toWallClock(
              new Date(start.getTime() + c.service.duracionMin * 60_000),
            ),
            text: `${c.pet.nombre} · ${c.service.nombre}`,
            estado: c.estado,
            vetId: c.vet._id,
          };
        }),
    [citasQuery.data, vetId, estado],
  );

  return (
    <div className={styles.calendarRoot}>
      <Willow fonts={false}>
        <Locale words={words}>
          <Calendar
            events={events}
            date={initialDate}
            view="week"
            views={["day", "week", "month"]}
            readonly
            init={init}
            eventCss={eventCss}
            onSelectEvent={(ev) => {
              const cita = ev.id != null ? citaById.get(String(ev.id)) : undefined;
              if (cita) onSelectRef.current(cita);
            }}
          />
        </Locale>
      </Willow>
    </div>
  );
}
