import { PageHeader } from "@/components/PageHeader/PageHeader";
import { AgendaView } from "@/components/AgendaView/AgendaView";
import { getVetsSerialized } from "@/lib/data/vets";
import { getServicesSerialized } from "@/lib/data/services";
import { getOwnersSerialized } from "@/lib/data/owners";
import { getPetsSerialized } from "@/lib/data/pets";

// R09: el server entrega el HTML inicial (catálogos por props) y la
// interactividad vive 100% en el cliente. La página lee la DB sin
// searchParams/cookies → dynamic explícito para no servir datos viejos.
export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const [vets, services, owners, pets] = await Promise.all([
    getVetsSerialized(),
    getServicesSerialized(),
    getOwnersSerialized(),
    getPetsSerialized(),
  ]);
  return (
    <>
      <PageHeader
        title="Agenda"
        description="Calendario de turnos. Click en un slot libre para agendar."
      />
      <AgendaView vets={vets} services={services} owners={owners} pets={pets} />
    </>
  );
}
