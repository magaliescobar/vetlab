"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Serialized } from "@/lib/models/serialized";
import type { Pet } from "@/lib/models/pet";
import { updatePet } from "@/actions/duenos";
import { INITIAL_FORM_STATE } from "@/lib/types/forms";
import { FormField } from "../FormField/FormField";
import { SubmitButton } from "../SubmitButton/SubmitButton";
import styles from "./PetEditForm.module.css";
import { ESPECIES } from "@/lib/utils";

export function PetEditForm({
  pet,
  onDone,
}: {
  pet: Serialized<Pet>;
  onDone: () => void;
}) {
  const [state, formAction] = useActionState(updatePet, INITIAL_FORM_STATE);

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
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Mascota</legend>
        <input type="hidden" name="id" value={pet._id} />
        <div className={styles.row}>
          <FormField
            label="Nombre"
            htmlFor="pet-nombre"
            error={err("petNombre")}
          >
            <input
              id="pet-nombre"
              name="petNombre"
              defaultValue={pet.nombre}
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
            <select
              id="pet-especie"
              name="petEspecie"
              defaultValue={pet.especie}
              required
              aria-invalid={err("petEspecie") ? "true" : undefined}
              aria-describedby={
                err("petEspecie") ? "pet-especie-error" : undefined
              }
            >
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
            <input id="pet-raza" name="petRaza" defaultValue={pet.raza ?? ""} />
          </FormField>
          <FormField
            label="Nacimiento (opcional)"
            htmlFor="pet-nacimiento"
            error={err("petFechaNacimiento")}
          >
            <input
              id="pet-nacimiento"
              name="petFechaNacimiento"
              type="date"
              defaultValue={pet.fechaNacimiento?.slice(0, 10) ?? ""}
            />
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
              defaultValue={pet.pesoKg ?? ""}
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
              defaultValue={pet.fotoUrl ?? ""}
            />
          </FormField>
        </div>
        <FormField
          label="Notas (opcional)"
          htmlFor="pet-notas"
          error={err("petNotas")}
        >
          <textarea
            id="pet-notas"
            name="petNotas"
            rows={2}
            defaultValue={pet.notas ?? ""}
          />
        </FormField>
      </fieldset>

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
