"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Service } from "@/lib/models/service";
import type { Serialized } from "@/lib/models/serialized";
import { updateService } from "@/actions/catalogo";
import { INITIAL_FORM_STATE } from "@/lib/types/forms";
import { FormField } from "../FormField/FormField";
import { SubmitButton } from "../SubmitButton/SubmitButton";
import styles from "./ServiceEditForm.module.css";

export function ServiceEditForm({
  service,
  onDone,
}: {
  service: Serialized<Service>;
  onDone: () => void;
}) {
  const [state, formAction] = useActionState(updateService, INITIAL_FORM_STATE);

  // onDone solo ante un state NUEVO (idem VetEditForm).
  const lastHandled = useRef(state);
  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (state.ok) onDone();
  }, [state, onDone]);

  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="id" value={service._id} />
      <FormField
        label="Nombre"
        htmlFor="service-nombre"
        error={err("nombre")}
      >
        <input
          id="service-nombre"
          name="nombre"
          defaultValue={service.nombre}
          required
          aria-invalid={err("nombre") ? "true" : undefined}
          aria-describedby={
            err("nombre") ? "service-nombre-error" : undefined
          }
        />
      </FormField>
      <FormField
        label="Descripción"
        htmlFor="service-descripcion"
        error={err("descripcion")}
      >
        <textarea
          id="service-descripcion"
          name="descripcion"
          defaultValue={service.descripcion}
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
            defaultValue={service.duracionMin}
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
            defaultValue={service.precio}
            required
            aria-invalid={err("precio") ? "true" : undefined}
            aria-describedby={
              err("precio") ? "service-precio-error" : undefined
            }
          />
        </FormField>
      </div>
      <label className={styles.activo}>
        <input
          type="checkbox"
          name="activo"
          defaultChecked={service.activo !== false}
        />
        Activo (reservable en agenda)
      </label>
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
