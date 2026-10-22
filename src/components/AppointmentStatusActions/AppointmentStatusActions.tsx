"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { updateAppointmentEstado } from "@/actions/citas";
import type { EstadoCita } from "@/lib/models/shared";
import type { FormState } from "@/lib/types/forms";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import styles from "./AppointmentStatusActions.module.css";

/**
 * R12 — Cambio de estado con UI optimista y rollback ante error.
 * `inTable` (default) renderiza celdas para AppointmentTable; `false`
 * renderiza divs para reutilizarlo fuera de una tabla (p. ej. el dialogo
 * de detalle de la agenda).
 */
export function AppointmentStatusActions({
  id,
  estado,
  inTable = true,
  onChanged,
}: {
  id: string;
  estado: EstadoCita;
  inTable?: boolean;
  /** En /agenda refresca el feed del calendario y los slots tras un cambio
   * exitoso. Recibe el estado al que pasó la cita. En /dashboard no se pasa
   * (la revalidación la hace revalidatePath en el server). */
  onChanged?: (estado: EstadoCita) => void;
}) {
  const [formState, dispatch] = useActionState<FormState, FormData>(
    updateAppointmentEstado,
    { ok: false },
  );
  // baseEstado = último estado real conocido (el prop, o el destino del último
  // cambio exitoso) y base de useOptimistic. En /agenda el padre no actualiza
  // el prop `estado` tras el cambio (selected queda stale): sin esto la UI
  // "rebotaría" al estado anterior al terminar la transition. Ante un error,
  // useOptimistic vuelve a este valor (rollback).
  const [baseEstado, setBaseEstado] = useState(estado);
  const [prevEstado, setPrevEstado] = useState(estado);
  // Sync con el prop: en /dashboard revalidatePath trae el estado nuevo.
  if (prevEstado !== estado) {
    setPrevEstado(estado);
    setBaseEstado(estado);
  }
  const [optimisticEstado, setOptimisticEstado] = useOptimistic(baseEstado);
  // Estado destino del último submit, para el callback post-éxito.
  const submittedRef = useRef<EstadoCita | null>(null);
  // Último onChanged: si el padre pasa un callback inline cambia de identidad
  // en cada render; depender de él en el efecto re-dispararía refreshAgenda en
  // bucle. El efecto solo corre cuando cambia formState.
  const onChangedRef = useRef(onChanged);
  useEffect(() => {
    onChangedRef.current = onChanged;
  });
  const Cell = inTable ? "td" : "div";

  useEffect(() => {
    if (formState.ok && submittedRef.current) {
      setBaseEstado(submittedRef.current);
      onChangedRef.current?.(submittedRef.current);
    }
  }, [formState]);

  function submit(formData: FormData) {
    const next = formData.get("estado") as EstadoCita;
    submittedRef.current = next;
    startTransition(() => {
      setOptimisticEstado(next);
      dispatch(formData);
    });
  }

  const terminal =
    optimisticEstado === "completada" || optimisticEstado === "cancelada";

  return (
    <>
      <Cell className={styles.estadoCell}>
        <Badge estado={optimisticEstado} />
        {formState && !formState.ok && formState.message ? (
          <span className={styles.error} role="alert">
            {formState.message}
          </span>
        ) : null}
      </Cell>
      <Cell className={styles.actionsCell}>
        {terminal ? null : (
          <form action={submit} className={styles.actions}>
            <input type="hidden" name="id" value={id} />
            {optimisticEstado === "pendiente" && (
              <Button
                type="submit"
                variant="secondary"
                name="estado"
                value="confirmada"
              >
                Confirmar
              </Button>
            )}
            {optimisticEstado === "confirmada" && (
              <Button
                type="submit"
                variant="primary"
                name="estado"
                value="completada"
              >
                Completar
              </Button>
            )}
            <Button
              type="submit"
              variant="ghost"
              name="estado"
              value="cancelada"
              className={styles.cancel}
            >
              Cancelar
            </Button>
          </form>
        )}
      </Cell>
    </>
  );
}
