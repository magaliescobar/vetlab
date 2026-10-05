import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VetLab",
  description: "Consola operativa de la clínica veterinaria",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
