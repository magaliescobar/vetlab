import Link from "next/link";

export default function NotFound() {
  return (
    <section>
      <h1>No encontrado</h1>
      <p>La página que buscás no existe.</p>
      <Link href="/dashboard">Volver al dashboard</Link>
    </section>
  );
}
