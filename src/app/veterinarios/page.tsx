import { PageHeader } from "@/components/PageHeader/PageHeader";
import { VetGrid } from "@/components/VetGrid/VetGrid";
import { getVetsCached } from "@/lib/data/vets";
import { NewVetButton } from "@/components/NewVetButton/NewVetButton";
import { AdminOnly } from "@/components/AdminOnly/AdminOnly";
import { Suspense } from "react";

// R04: la página se prerenderiza con la data cacheada de getVetsCached
// (tag "vets", cacheLife "hours") → se regenera ~cada 1h o por revalidateTag.
export default async function VeterinariosPage() {
  const vets = await getVetsCached();
  return (
    <>
      <PageHeader
        title="Veterinarios"
        description="Equipo profesional y horarios de atención."
        actions={
          <Suspense fallback={null}>
            <AdminOnly>
              <NewVetButton />
            </AdminOnly>
          </Suspense>
        }
      />
      <VetGrid vets={vets} />
    </>
  );
}
