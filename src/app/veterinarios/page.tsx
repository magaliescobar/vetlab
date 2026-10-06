import { PageHeader } from "@/components/PageHeader/PageHeader";
import { VetGrid } from "@/components/VetGrid/VetGrid";
import { getVetsCached } from "@/lib/data/vets";

// R04: la página se prerenderiza con la data cacheada de getVetsCached
// (tag "vets", cacheLife "hours") → se regenera ~cada 1h o por revalidateTag.
export default async function VeterinariosPage() {
  const vets = await getVetsCached();
  return (
    <>
      <PageHeader
        title="Veterinarios"
        description="Equipo profesional y horarios de atención."
      />
      <VetGrid vets={vets} />
    </>
  );
}
