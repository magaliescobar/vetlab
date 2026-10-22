import { PageHeader } from "@/components/PageHeader/PageHeader";
import { ServiceGrid } from "@/components/ServiceGrid/ServiceGrid";
import { NewServiceButton } from "@/components/NewServiceButton/NewServiceButton";
import { AdminOnly } from "@/components/AdminOnly/AdminOnly";
import { getServicesCached } from "@/lib/data/services";
import { Suspense } from "react";

// J4: catálogo de servicios con "use cache" (tag "services", cacheLife
// "hours") → estático y prefetcheado; los cambios se reflejan al instante
// vía updateTag desde createService/updateService.
export default async function ServiciosPage() {
  const services = await getServicesCached();
  return (
    <>
      <PageHeader
        title="Servicios"
        description="Catálogo de servicios y duración de turnos."
        actions={
          <Suspense fallback={null}>
            <AdminOnly>
              <NewServiceButton />
            </AdminOnly>
          </Suspense>
        }
      />
      <ServiceGrid services={services} />
    </>
  );
}
