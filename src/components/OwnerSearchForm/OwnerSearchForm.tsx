import { Button } from "../Button/Button";
import styles from "./OwnerSearchForm.module.css";

/**
 * R07 — la búsqueda vive en la URL (searchParams). Form GET puro,
 * sin estado de cliente ni debounce.
 */
export function OwnerSearchForm({ q }: { q: string }) {
  return (
    <form method="GET" action="/duenos" className={styles.form}>
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder="Buscar por nombre, email o teléfono…"
        className={styles.input}
        aria-label="Buscar dueños"
      />
      <Button type="submit" variant="secondary">
        Buscar
      </Button>
    </form>
  );
}
