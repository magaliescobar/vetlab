"use client";

import { useState } from "react";
import type { Pet } from "@/lib/models/pet";
import type { Serialized } from "@/lib/models/serialized";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import { PetEditForm } from "../PetEditForm/PetEditForm";

export function PetEditButton({ pet }: { pet: Serialized<Pet> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Editar
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Editar — ${pet.nombre}`}
      >
        <PetEditForm pet={pet} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
