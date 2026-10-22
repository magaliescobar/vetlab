import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { NavLink, NavLinkFallback } from "../NavLink/NavLink";
import { AuthButton } from "../AuthButton/AuthButton";
import styles from "./AppShell.module.css";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/agenda", label: "Agenda" },
  { href: "/duenos", label: "Dueños" },
  { href: "/veterinarios", label: "Veterinarios" },
  { href: "/servicios", label: "Servicios" },
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
            <Suspense
              fallback={NAV.map((item) => (
                <NavLinkFallback key={item.href} href={item.href}>
                  {item.label}
                </NavLinkFallback>
              ))}
            >
              {NAV.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </Suspense>
          </nav>
          <div className={styles.authSlot}>
            <Suspense fallback={null}>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.container}>{children}</div>
      </main>
    </div>
  );
}
