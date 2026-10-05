import Link from "next/link";
import clsx from "clsx";
import styles from "./Pagination.module.css";

function href(basePath: string, params: Record<string, string>, page: number) {
  const sp = new URLSearchParams(params);
  sp.set("page", String(page));
  return `${basePath}?${sp.toString()}`;
}

export function Pagination({
  basePath,
  params,
  page,
  totalPages,
}: {
  basePath: string;
  params: Record<string, string>;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className={styles.pagination} aria-label="Paginación">
      {page > 1 ? (
        <Link className={styles.link} href={href(basePath, params, page - 1)}>
          ‹ Anterior
        </Link>
      ) : (
        <span className={clsx(styles.link, styles.disabled)}>‹ Anterior</span>
      )}
      <span className={styles.info}>
        Página {page} de {totalPages}
      </span>
      {page < totalPages ? (
        <Link className={styles.link} href={href(basePath, params, page + 1)}>
          Siguiente ›
        </Link>
      ) : (
        <span className={clsx(styles.link, styles.disabled)}>Siguiente ›</span>
      )}
    </nav>
  );
}
