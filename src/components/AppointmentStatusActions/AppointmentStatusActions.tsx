"use client";

import { startTransition, useActionState, useOptimistic } from "react";
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
}: {
  id: string;
  estado: EstadoCita;
  inTable?: boolean;
}) {
  const [formState, dispatch] = useActionState<FormState, FormData>(
    updateAppointmentEstado,
    { ok: true },
  );
  const [optimisticEstado, setOptimisticEstado] = useOptimistic(estado);
  const Cell = inTable ? "td" : "div";

  function submit(formData: FormData) {
    const next = formData.get("estado") as EstadoCita;
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
