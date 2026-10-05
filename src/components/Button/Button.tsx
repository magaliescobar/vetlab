import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type={type}
      className={clsx(styles.button, styles[variant], className)}
      {...rest}
    />
  );
}
