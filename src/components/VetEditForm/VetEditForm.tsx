"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Vet } from "@/lib/models/vet";
import type { Serialized } from "@/lib/models/serialized";
import { updateVet } from "@/actions/catalogo";
import { INITIAL_FORM_STATE } from "@/lib/types/forms";
import { FormField } from "../FormField/FormField";
import { SubmitButton } from "../SubmitButton/SubmitButton";
import { HorariosFieldset } from "../HorariosFieldset/HorariosFieldset";
import styles from "./VetEditForm.module.css";

export function VetEditForm({
  vet,
  onDone,
}: {
  vet: Serialized<Vet>;
  onDone: () => void;
}) {
  const [state, formAction] = useActionState(updateVet, INITIAL_FORM_STATE);

  // onDone solo ante un state NUEVO: si se dispara por un state.ok viejo
  // (onDone cambia de identidad en cada render del padre), el modal se
  // re-cerraría al instante al reabrirlo.
  const lastHandled = useRef(state);
  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (state.ok) onDone();
  }, [state, onDone]);

  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="id" value={vet._id} />
      <FormField label="Nombre" htmlFor="vet-nombre" error={err("nombre")}>
        <input
          id="vet-nombre"
          name="nombre"
          defaultValue={vet.nombre}
          required
          aria-invalid={err("nombre") ? "true" : undefined}
          aria-describedby={err("nombre") ? "vet-nombre-error" : undefined}
        />
      </FormField>
      <FormField
        label="Especialidad"
        htmlFor="vet-especialidad"
        error={err("especialidad")}
      >
        <input
          id="vet-especialidad"
          name="especialidad"
          defaultValue={vet.especialidad}
          required
          aria-invalid={err("especialidad") ? "true" : undefined}
          aria-describedby={
            err("especialidad") ? "vet-especialidad-error" : undefined
          }
        />
      </FormField>
      <FormField label="Bio" htmlFor="vet-bio" error={err("bio")}>
        <textarea
          id="vet-bio"
          name="bio"
          defaultValue={vet.bio ?? ""}
          rows={3}
          aria-invalid={err("bio") ? "true" : undefined}
          aria-describedby={err("bio") ? "vet-bio-error" : undefined}
        />
      </FormField>
      <HorariosFieldset initial={vet.horarios} error={err("horarios")} />
      {state.message && !state.ok ? (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      ) : null}
      <div className={styles.actions}>
        <SubmitButton>Guardar cambios</SubmitButton>
      </div>
    </form>
  );
}
