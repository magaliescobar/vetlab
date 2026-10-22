"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import styles from "./OwnerSearchForm.module.css";

/**
 * R07 — la búsqueda vive en la URL (searchParams). Input client con
 * debounce que escribe `?q=` vía router.replace; el server renderiza
 * los resultados según la URL.
 */
export function OwnerSearchForm({ q }: { q: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    const value = term.trim();
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    params.delete("page");
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, 300);

  return (
    <div className={styles.form}>
      <input
        type="search"
        defaultValue={q}
        placeholder="Buscar por nombre, email o teléfono…"
        className={styles.input}
        aria-label="Buscar dueños"
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
