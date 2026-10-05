import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "VetLab",
  description: "Consola operativa de la clínica veterinaria",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
