"use client";

import { useState } from "react";
import type { Vet } from "@/lib/models/vet";
import type { Serialized } from "@/lib/models/serialized";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import { VetEditForm } from "../VetEditForm/VetEditForm";

export function VetEditButton({ vet }: { vet: Serialized<Vet> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Editar
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Editar — ${vet.nombre}`}
      >
        <VetEditForm vet={vet} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
