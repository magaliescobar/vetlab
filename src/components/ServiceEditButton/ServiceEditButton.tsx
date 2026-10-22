"use client";

import { useState } from "react";
import type { Service } from "@/lib/models/service";
import type { Serialized } from "@/lib/models/serialized";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import { ServiceEditForm } from "../ServiceEditForm/ServiceEditForm";

export function ServiceEditButton({
  service,
}: {
  service: Serialized<Service>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Editar
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Editar — ${service.nombre}`}
      >
        <ServiceEditForm service={service} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
