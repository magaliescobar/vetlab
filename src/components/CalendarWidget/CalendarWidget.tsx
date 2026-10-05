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
  // Rango visible del calendario en UTC (el widget trabaja en "wall clock").
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const onDateChangeRef = useRef(onDateChange);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onDateChangeRef.current = onDateChange;
    onSelectRef.current = onSelect;
  });

  const citasQuery = useQuery({
    queryKey: ["citas", range?.from, range?.to],
    queryFn: () => fetchCitas(range!.from, range!.to),
    enabled: range !== null,
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

  // Fecha inicial en "wall clock" (memoizada: props de fecha/vista son
  // reactivos por identidad; una Date nueva por render resetearía la vista).
  const initialDate = useMemo(() => toWallClock(new Date()), []);

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
