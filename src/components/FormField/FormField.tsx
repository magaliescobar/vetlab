import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./FormField.module.css";

/**
 * Label + control + mensaje de error accesible.
 * El control (input/select/textarea) lo pasa el caller con id={htmlFor},
 * name y aria-describedby={errorId} cuando hay error.
 */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string | string[];
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  const errorId = `${htmlFor}-error`;
  const messages = Array.isArray(error) ? error : error ? [error] : [];
  return (
    <div className={clsx(styles.field, className)}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
      </label>
      {children}
      {hint && messages.length === 0 ? (
        <p className={styles.hint}>{hint}</p>
      ) : null}
      {messages.map((m) => (
        <p key={m} id={errorId} className={styles.error} role="alert">
          {m}
        </p>
      ))}
    </div>
  );
}
