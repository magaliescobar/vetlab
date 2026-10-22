"use client";

import { useState } from "react";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import { NewPetForm } from "@/components/NewPetForm/NewPetForm";

export function NewPetButton({ ownerId }: { ownerId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Nueva Mascota
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Registrar Mascota"
      >
        <NewPetForm ownerId={ownerId} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
