"use client";

import { useState } from "react";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import { NewOwnerForm } from "../NewOwnerForm/NewOwnerForm";

export function NewOwnerButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Nuevo dueño
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Registrar dueño y primera mascota"
      >
        <NewOwnerForm />
      </Dialog>
    </>
  );
}
