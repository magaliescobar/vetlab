"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import styles from "./Pagination.module.css";
import { generatePagination } from "@/lib/utils";

function href(basePath: string, params: Record<string, string>, page: number) {
  const sp = new URLSearchParams(params);
  sp.set("page", String(page));
  return `${basePath}?${sp.toString()}`;
}

export function Pagination({
  totalPage
}: {
  totalPage: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentpage = Number(searchParams.get("page")) || 1;

  const createPageUrl = (page: number) => {
    const sp = new URLSearchParams(searchParams);
    sp.set("page", String(page));
    return `${pathname}?${sp.toString()}`;
  };

   const allPages = generatePagination(currentpage, totalPage);

  if (totalPage <= 1) return null;
  return (
    <nav className={styles.pagination} aria-label="Paginación">
      {currentpage > 1 ? (
        <Link className={styles.link} href={createPageUrl(currentpage - 1)}>
          ‹ Anterior
        </Link>
      ) : (
        <span className={clsx(styles.link, styles.disabled)}>‹ Anterior</span>
      )}
      <span className={styles.info}>
        Página {currentpage} de {allPages}
      </span>
      {currentpage < allPages.length ? (
        <Link className={styles.link} href={createPageUrl(currentpage + 1)}>
          Siguiente ›
        </Link>
      ) : (
        <span className={clsx(styles.link, styles.disabled)}>Siguiente ›</span>
      )}
    </nav>
  );
}
