import type { ReactNode } from "react";
import Link from "next/link";
import { NavLink } from "../NavLink/NavLink";
import styles from "./AppShell.module.css";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/agenda", label: "Agenda" },
  { href: "/duenos", label: "Dueños" },
  { href: "/veterinarios", label: "Veterinarios" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/dashboard" className={styles.brand}>
            VetLab
          </Link>
          <nav className={styles.nav} aria-label="Navegación principal">
            {NAV.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.container}>{children}</div>
      </main>
    </div>
  );
}
