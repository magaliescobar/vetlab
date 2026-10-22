"use client";

import { useActionState, useEffect, useRef } from "react";
import { registerNewPet } from "@/actions/duenos";
import { INITIAL_FORM_STATE } from "@/lib/types/forms";
import { FormField } from "../FormField/FormField";
import { SubmitButton } from "../SubmitButton/SubmitButton";
import styles from "./NewPetForm.module.css";
import { ESPECIES } from "@/lib/utils";

/** R13 — Alta de nueva mascota. */
export function NewPetForm({ ownerId, onDone }: { ownerId: string; onDone: () => void }) {
  const [state, formAction] = useActionState(
    registerNewPet,
    INITIAL_FORM_STATE,
  );

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
        <legend className={styles.legend}>Mascota</legend>
        <div className={styles.row}>
          <FormField
            label="Nombre"
            htmlFor="pet-nombre"
            error={err("petNombre")}
          >
            <input
              id="pet-nombre"
              name="petNombre"
              required
              aria-invalid={err("petNombre") ? "true" : undefined}
              aria-describedby={
                err("petNombre") ? "pet-nombre-error" : undefined
              }
            />
          </FormField>
          <FormField
            label="Especie"
            htmlFor="pet-especie"
            error={err("petEspecie")}
          >
            <select id="pet-especie" name="petEspecie" required>
              {ESPECIES.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className={styles.row}>
          <FormField
            label="Raza (opcional)"
            htmlFor="pet-raza"
            error={err("petRaza")}
          >
            <input id="pet-raza" name="petRaza" />
          </FormField>
          <FormField
            label="Nacimiento (opcional)"
            htmlFor="pet-nacimiento"
            error={err("petFechaNacimiento")}
          >
            <input id="pet-nacimiento" name="petFechaNacimiento" type="date" />
          </FormField>
          <FormField
            label="Peso kg (opcional)"
            htmlFor="pet-peso"
            error={err("petPesoKg")}
          >
            <input
              id="pet-peso"
              name="petPesoKg"
              inputMode="decimal"
              placeholder="4.5"
            />
          </FormField>
          <FormField
            label="Foto URL (opcional)"
            htmlFor="pet-foto"
            error={err("petFotoUrl")}
          >
            <input
              id="pet-foto"
              name="petFotoUrl"
              placeholder="URL de la foto"
            />
          </FormField>
        </div>
        <FormField
          label="Notas (opcional)"
          htmlFor="pet-notas"
          error={err("petNotas")}
        >
          <textarea id="pet-notas" name="petNotas" rows={2} />
          <input type="hidden" name="ownerId" value={ownerId} />
        </FormField>
      </fieldset>

      {state.message && !state.ok ? (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      ) : null}
      <div className={styles.actions}>
        <SubmitButton>Registrar mascota</SubmitButton>
      </div>
    </form>
  );
}
