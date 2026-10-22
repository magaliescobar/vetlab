"use client";

import { useActionState, useEffect, useRef } from "react";
import { createService } from "@/actions/catalogo";
import { INITIAL_FORM_STATE } from "@/lib/types/forms";
import { FormField } from "../FormField/FormField";
import { SubmitButton } from "../SubmitButton/SubmitButton";
import styles from "./NewServiceForm.module.css";

export function NewServiceForm({ onDone }: { onDone: () => void }) {
  const [state, formAction] = useActionState(createService, INITIAL_FORM_STATE);

  // Idem VetEditForm: ignorar state.ok ya consumido, o el modal se cierra
  // apenas se reabre.
  const lastHandled = useRef(state);
  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (state.ok) onDone();
  }, [state, onDone]);

  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <form action={formAction} className={styles.form}>
      <FormField
        label="Nombre"
        htmlFor="service-nombre"
        error={err("nombre")}
      >
        <input
          id="service-nombre"
          name="nombre"
          required
          aria-invalid={err("nombre") ? "true" : undefined}
          aria-describedby={
            err("nombre") ? "service-nombre-error" : undefined
          }
        />
      </FormField>
      <FormField
        label="Descripción (opcional)"
        htmlFor="service-descripcion"
        error={err("descripcion")}
      >
        <textarea
          id="service-descripcion"
          name="descripcion"
          rows={3}
          aria-invalid={err("descripcion") ? "true" : undefined}
          aria-describedby={
            err("descripcion") ? "service-descripcion-error" : undefined
          }
        />
      </FormField>
      <div className={styles.row}>
        <FormField
          label="Duración (min)"
          htmlFor="service-duracion"
          error={err("duracionMin")}
        >
          <input
            id="service-duracion"
            name="duracionMin"
            type="number"
            min={5}
            max={480}
            step={5}
            required
            aria-invalid={err("duracionMin") ? "true" : undefined}
            aria-describedby={
              err("duracionMin") ? "service-duracion-error" : undefined
            }
          />
        </FormField>
        <FormField
          label="Precio ($)"
          htmlFor="service-precio"
          error={err("precio")}
        >
          <input
            id="service-precio"
            name="precio"
            type="number"
            min={0}
            step={50}
            required
            aria-invalid={err("precio") ? "true" : undefined}
            aria-describedby={
              err("precio") ? "service-precio-error" : undefined
            }
          />
        </FormField>
      </div>
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
