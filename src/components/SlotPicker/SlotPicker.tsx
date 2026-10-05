"use client";

import { useQuery } from "@tanstack/react-query";
import type { Vet } from "@/lib/models/vet";
import type { Serialized } from "@/lib/models/serialized";
import type { Slot } from "@/lib/models/views";
import { formatHora } from "@/lib/format";
import { toLocalIso, toWallClock } from "@/lib/datetime";
import { Button } from "../Button/Button";
import { Skeleton } from "../Skeleton/Skeleton";
import styles from "./SlotPicker.module.css";

async function fetchSlots(vetId: string, date: string): Promise<Slot[]> {
  const res = await fetch(`/api/disponibilidad?vetId=${vetId}&date=${date}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Error al cargar disponibilidad");
  }
  return res.json() as Promise<Slot[]>;
}

/**
 * R10 — Slots del vet en el día visible del calendario, via TanStack Query:
 * loading, error con refetch, y cache por (vetId, date) al volver al día.
 */
export function SlotPicker({
  vetId,
  vets,
  dateISO,
  onPick,
}: {
  vetId: string;
  vets: Serialized<Vet[]>;
  dateISO: string;
  onPick: (fechaHora: string) => void;
}) {
  const slotsQuery = useQuery({
    queryKey: ["slots", vetId, dateISO],
    queryFn: () => fetchSlots(vetId, dateISO),
    enabled: Boolean(vetId && dateISO),
    placeholderData: (prev) => prev,
  });

  const vetNombre = vets.find((v) => v._id === vetId)?.nombre;

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>Horarios{vetNombre ? ` — ${vetNombre}` : ""}</h2>
      <p className={styles.date}>{dateISO || "…"}</p>

      {!vetId ? (
        <p className={styles.hint}>Elegí un veterinario para ver los horarios libres.</p>
      ) : slotsQuery.isPending ? (
        <Skeleton lines={6} />
      ) : slotsQuery.isError ? (
        <div className={styles.errorBox} role="alert">
          <p className={styles.errorText}>{slotsQuery.error.message}</p>
          <Button variant="secondary" onClick={() => slotsQuery.refetch()}>
            Reintentar
          </Button>
        </div>
      ) : slotsQuery.data.length === 0 ? (
        <p className={styles.hint}>El veterinario no atiende este día.</p>
      ) : (
        <div className={styles.grid}>
          {slotsQuery.data.map((slot) => (
            <button
              key={slot.inicio}
              type="button"
              className={
                slot.disponible ? styles.slotLibre : styles.slotOcupado
              }
              disabled={!slot.disponible}
              onClick={() =>
                onPick(toLocalIso(toWallClock(new Date(slot.inicio))))
              }
              title={slot.disponible ? "Agendar en este horario" : "Ocupado"}
            >
              {formatHora(slot.inicio)}
            </button>
          ))}
        </div>
      )}
      {slotsQuery.isFetching && !slotsQuery.isPending ? (
        <p className={styles.hint}>Actualizando…</p>
      ) : null}
    </div>
  );
}
