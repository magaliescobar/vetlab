"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createAppointment } from "@/actions/citas";
import { INITIAL_FORM_STATE } from "@/lib/types/forms";
import type { Owner } from "@/lib/models/owner";
import type { Pet } from "@/lib/models/pet";
import type { Service } from "@/lib/models/service";
import type { Vet } from "@/lib/models/vet";
import type { Serialized } from "@/lib/models/serialized";
import type { BookingTarget } from "../AgendaView/AgendaView";
import { formatFechaIso } from "@/lib/format";
import { Dialog } from "../Dialog/Dialog";
import { FormField } from "../FormField/FormField";
import { SubmitButton } from "../SubmitButton/SubmitButton";
import styles from "./BookingDialog.module.css";

interface Props {
  target: BookingTarget | null;
  owners: Serialized<Owner[]>;
  pets: Serialized<Pet[]>;
  vets: Serialized<Vet[]>;
  services: Serialized<Service[]>;
  onClose: () => void;
  /** Se dispara solo tras un alta exitosa (el padre refresca slots + citas). */
  onBooked: () => void;
}

/** R11 — Form de agendar por Server Action. La hora llega precargada del slot. */
export function BookingDialog({
  target,
  owners,
  pets,
  vets,
  services,
  onClose,
  onBooked,
}: Props) {
  return (
    <Dialog
      open={target !== null}
      onClose={onClose}
      title="Agendar cita"
    >
      {target ? (
        <BookingForm
          key={`${target.vetId}|${target.fechaHora}`}
          target={target}
          owners={owners}
          pets={pets}
          vets={vets}
          services={services}
          onDone={onClose}
          onBooked={onBooked}
        />
      ) : null}
    </Dialog>
  );
}

function BookingForm({
  target,
  owners,
  pets,
  vets,
  services,
  onDone,
  onBooked,
}: Omit<Props, "onClose"> & {
  target: BookingTarget;
  onDone: () => void;
}) {
  const [state, formAction] = useActionState(
    createAppointment,
    INITIAL_FORM_STATE,
  );
  const [ownerId, setOwnerId] = useState("");
  const [petId, setPetId] = useState("");
  const [formKey, setFormKey] = useState(0);

  const lastHandled = useRef(state);
  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (!state.ok) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- remonta el form para limpiar inputs no controlados tras un submit fallido
      setFormKey((k) => k + 1);
      return;
    }
    // R10: avisar al padre para refrescar slots + feed de citas.
    onBooked();
    onDone();
  }, [state, onBooked, onDone]);

  const petsDelOwner = useMemo(
    () => pets.filter((p) => p.ownerId === ownerId),
    [pets, ownerId],
  );

  const err = (f: string) => state.fieldErrors?.[f];
  const [fecha, hora] = target.fechaHora.split("T");

  return (
    <form key={formKey} action={formAction} className={styles.form}>
      <input type="hidden" name="fechaHora" value={target.fechaHora} />
      <input type="hidden" name="vetId" value={target.vetId} />
      <p className={styles.resumen}>
        {formatFechaIso(fecha)} a las {hora}
      </p>
      {err("fechaHora")?.map((m) => (
        <p key={m} className={styles.formError} role="alert">
          {m}
        </p>
      ))}

      <FormField label="Dueño" htmlFor="cita-owner" error={err("ownerId")}>
        <select
          id="cita-owner"
          name="ownerId"
          required
          value={ownerId}
          onChange={(e) => {
            setOwnerId(e.target.value);
            setPetId("");
          }}
          aria-invalid={err("ownerId") ? "true" : undefined}
          aria-describedby={err("ownerId") ? "cita-owner-error" : undefined}
        >
          <option value="" disabled>
            Elegir…
          </option>
          {owners.map((o) => (
            <option key={o._id} value={o._id}>
              {o.apellido}, {o.nombre}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Mascota" htmlFor="cita-pet" error={err("petId")}>
        <select
          id="cita-pet"
          name="petId"
          required
          disabled={!ownerId}
          value={petId}
          onChange={(e) => setPetId(e.target.value)}
          aria-invalid={err("petId") ? "true" : undefined}
          aria-describedby={err("petId") ? "cita-pet-error" : undefined}
        >
          <option value="" disabled>
            {ownerId ? "Elegir…" : "Primero elegí el dueño"}
          </option>
          {petsDelOwner.map((p) => (
            <option key={p._id} value={p._id}>
              {p.nombre} ({p.especie})
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Veterinario" htmlFor="cita-vet" error={err("vetId")}>
        <select
          id="cita-vet"
          value={target.vetId}
          disabled
          aria-invalid={err("vetId") ? "true" : undefined}
          aria-describedby={err("vetId") ? "cita-vet-error" : undefined}
        >
          {vets.map((v) => (
            <option key={v._id} value={v._id}>
              {v.nombre} — {v.especialidad}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Servicio" htmlFor="cita-service" error={err("serviceId")}>
        <select
          id="cita-service"
          name="serviceId"
          required
          aria-invalid={err("serviceId") ? "true" : undefined}
          aria-describedby={err("serviceId") ? "cita-service-error" : undefined}
        >
          {services
            .filter((s) => s.activo !== false)
            .map((s) => (
              <option key={s._id} value={s._id}>
                {s.nombre} ({s.duracionMin} min)
              </option>
            ))}
        </select>
      </FormField>

      <FormField
        label="Motivo (opcional)"
        htmlFor="cita-motivo"
        error={err("motivo")}
      >
        <input id="cita-motivo" name="motivo" maxLength={500} />
      </FormField>

      {state.message && !state.ok ? (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      ) : null}
      <div className={styles.actions}>
        <SubmitButton>Agendar</SubmitButton>
      </div>
    </form>
  );
}
