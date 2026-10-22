"use client";

import { useActionState, useEffect, useRef } from "react";
import { createVet } from "@/actions/catalogo";
import { INITIAL_FORM_STATE } from "@/lib/types/forms";
import { FormField } from "../FormField/FormField";
import { SubmitButton } from "../SubmitButton/SubmitButton";
import { HorariosFieldset } from "../HorariosFieldset/HorariosFieldset";
import styles from "./NewVetForm.module.css";

/** Alta de veterinario con franjas horarias dinámicas por día. */
export function NewVetForm({ onDone }: { onDone: () => void }) {
  const [state, formAction] = useActionState(createVet, INITIAL_FORM_STATE);

  // Idem VetEditForm: ignorar state.ok ya consumido, o el modal se cierra
  // apenas se reabre (onDone es una función nueva en cada render del padre).
  const lastHandled = useRef(state);
  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (state.ok) onDone();
  }, [state, onDone]);

  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <form action={formAction} className={styles.form}>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Veterinario/a</legend>
        <div className={styles.row}>
          <FormField label="Nombre" htmlFor="vet-nombre" error={err("nombre")}>
            <input
              id="vet-nombre"
              name="nombre"
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
              required
              aria-invalid={err("especialidad") ? "true" : undefined}
              aria-describedby={
                err("especialidad") ? "vet-especialidad-error" : undefined
              }
            />
          </FormField>
        </div>
        <FormField
          label="Bio (opcional)"
          htmlFor="vet-bio"
          error={err("bio")}
        >
          <textarea id="vet-bio" name="bio" rows={3} />
        </FormField>
      </fieldset>

      <HorariosFieldset error={err("horarios")} />

      {state.message && !state.ok ? (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      ) : null}
      <div className={styles.actions}>
        <SubmitButton>Registrar</SubmitButton>
      </div>
    </form>
  );
}
