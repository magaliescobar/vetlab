import { PageHeader } from "@/components/PageHeader/PageHeader";
import { VetGrid } from "@/components/VetGrid/VetGrid";
import { getVetsCached } from "@/lib/data/vets";

// R04: ISR por tiempo — la página se prerenderiza y se regenera cada 1h.
export const revalidate = 3600;

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
