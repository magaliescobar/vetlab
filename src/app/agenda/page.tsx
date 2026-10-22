import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { AgendaView } from "@/components/AgendaView/AgendaView";
import { SectionSkeleton } from "@/components/SectionSkeleton/SectionSkeleton";
import { getVetsCached } from "@/lib/data/vets";
import { getServicesCached } from "@/lib/data/services";
import { getOwnersCached } from "@/lib/data/owners";
import { getPetsCached } from "@/lib/data/pets";

// R09: el server entrega el HTML inicial (catálogos por props) y la
// interactividad vive 100% en el cliente. Los catálogos usan "use cache"
// con tags → las mutaciones los invalidan con updateTag.
// searchParams dentro del Suspense marca la ruta ◐ (misma técnica que
// /dashboard y /duenos): sin runtime API la página quedaría ○ y el SSR
// congelaría la fecha del build → hydration mismatch al abrir otro día.
export default function AgendaPage({
  searchParams,
}: PageProps<"/agenda">) {
  return (
    <>
      <PageHeader
        title="Agenda"
        description="Calendario de turnos."
      />
      <Suspense fallback={<SectionSkeleton title="Turnos" />}>
        <AgendaContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function AgendaContent({
  searchParams,
}: Pick<PageProps<"/agenda">, "searchParams">) {
  await searchParams; // runtime API → dynamic render (no se usa el valor)
  const [vets, services, owners, pets] = await Promise.all([
    getVetsCached(),
    getServicesCached(),
    getOwnersCached(),
    getPetsCached(),
  ]);
  // Servicios inactivos no se ofrecen para reservar (admin los ve en /servicios).
  const activos = services.filter((s) => s.activo !== false);
  return (
    <AgendaView vets={vets} services={activos} owners={owners} pets={pets} />
  );
}
