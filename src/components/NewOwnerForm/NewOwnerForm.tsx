"use client";

import { useActionState } from "react";
import { registerOwnerWithPet } from "@/actions/duenos";
import { INITIAL_FORM_STATE } from "@/lib/types/forms";
import type { Especie } from "@/lib/models/shared";
import { FormField } from "../FormField/FormField";
import { SubmitButton } from "../SubmitButton/SubmitButton";
import styles from "./NewOwnerForm.module.css";

const ESPECIES: { value: Especie; label: string }[] = [
  { value: "perro", label: "Perro" },
  { value: "gato", label: "Gato" },
  { value: "ave", label: "Ave" },
  { value: "roedor", label: "Roedor" },
  { value: "reptil", label: "Reptil" },
  { value: "otro", label: "Otro" },
];

/** R13 — Alta de dueño + primera mascota. Al éxito, la action redirige al perfil. */
export function NewOwnerForm() {
  const [state, formAction] = useActionState(
    registerOwnerWithPet,
    INITIAL_FORM_STATE,
  );
  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <form action={formAction} className={styles.form}>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Dueño</legend>
        <div className={styles.row}>
          <FormField label="Nombre" htmlFor="owner-nombre" error={err("nombre")}>
            <input
              id="owner-nombre"
              name="nombre"
              required
              aria-invalid={err("nombre") ? "true" : undefined}
              aria-describedby={err("nombre") ? "owner-nombre-error" : undefined}
            />
          </FormField>
          <FormField
            label="Apellido"
            htmlFor="owner-apellido"
            error={err("apellido")}
          >
            <input
              id="owner-apellido"
              name="apellido"
              required
              aria-invalid={err("apellido") ? "true" : undefined}
              aria-describedby={
                err("apellido") ? "owner-apellido-error" : undefined
              }
            />
          </FormField>
        </div>
        <div className={styles.row}>
          <FormField label="Email" htmlFor="owner-email" error={err("email")}>
            <input
              id="owner-email"
              name="email"
              type="email"
              required
              aria-invalid={err("email") ? "true" : undefined}
              aria-describedby={err("email") ? "owner-email-error" : undefined}
            />
          </FormField>
          <FormField
            label="Teléfono"
            htmlFor="owner-telefono"
            error={err("telefono")}
          >
            <input
              id="owner-telefono"
              name="telefono"
              required
              aria-invalid={err("telefono") ? "true" : undefined}
              aria-describedby={
                err("telefono") ? "owner-telefono-error" : undefined
              }
            />
          </FormField>
        </div>
        <FormField
          label="Dirección (opcional)"
          htmlFor="owner-direccion"
          error={err("direccion")}
        >
          <input id="owner-direccion" name="direccion" />
        </FormField>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Primera mascota</legend>
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
              placeholder="https://..."
            />
          </FormField>
        </div>
        <FormField
          label="Notas (opcional)"
          htmlFor="pet-notas"
          error={err("petNotas")}
        >
          <textarea id="pet-notas" name="petNotas" rows={2} />
        </FormField>
      </fieldset>

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
