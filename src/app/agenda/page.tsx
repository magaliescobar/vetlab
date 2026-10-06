import { Suspense } from "react";
import { connection } from "next/server";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { AgendaView } from "@/components/AgendaView/AgendaView";
import { SectionSkeleton } from "@/components/SectionSkeleton/SectionSkeleton";
import { getVetsSerialized } from "@/lib/data/vets";
import { getServicesSerialized } from "@/lib/data/services";
import { getOwnersSerialized } from "@/lib/data/owners";
import { getPetsSerialized } from "@/lib/data/pets";

// R09: el server entrega el HTML inicial (catálogos por props) y la
// interactividad vive 100% en el cliente. La página lee la DB sin
// searchParams/cookies → instant=false + connection() dentro de Suspense
// para renderizar a request time y no servir datos viejos.
export const instant = false;

export default function AgendaPage() {
  return (
    <>
      <PageHeader
        title="Agenda"
        description="Calendario de turnos. Click en un slot libre para agendar."
      />
      <Suspense fallback={<SectionSkeleton title="Turnos" />}>
        <AgendaContent />
      </Suspense>
    </>
  );
}

async function AgendaContent() {
  await connection();
  const [vets, services, owners, pets] = await Promise.all([
    getVetsSerialized(),
    getServicesSerialized(),
    getOwnersSerialized(),
    getPetsSerialized(),
  ]);
  return <AgendaView vets={vets} services={services} owners={owners} pets={pets} />;
}
