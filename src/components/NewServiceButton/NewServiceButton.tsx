"use client";

import { useState } from "react";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import { NewServiceForm } from "../NewServiceForm/NewServiceForm";

export function NewServiceButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Nuevo Servicio
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Registrar Servicio"
      >
        <NewServiceForm onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
