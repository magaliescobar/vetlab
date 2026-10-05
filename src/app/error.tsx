"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <h1>Algo salió mal</h1>
      <p>{error.message || "Error inesperado."}</p>
      <button onClick={reset}>Reintentar</button>
    </main>
  );
}
