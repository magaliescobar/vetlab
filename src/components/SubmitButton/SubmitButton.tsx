"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonVariant } from "../Button/Button";

export function SubmitButton({
  children = "Guardar",
  pendingLabel = "Guardando…",
  variant = "primary",
}: {
  children?: React.ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
