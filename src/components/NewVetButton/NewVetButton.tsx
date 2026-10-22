"use client";

import { useState } from "react";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import { NewVetForm } from "../NewVetForm/NewVetForm";

export function NewVetButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Nuevo Veterinario/a
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Registrar Veterinario/a"
      >
        <NewVetForm onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
