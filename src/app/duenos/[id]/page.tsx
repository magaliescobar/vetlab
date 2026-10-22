import { Suspense } from "react";
import { notFound } from "next/navigation";
import { OwnerHeader } from "@/components/OwnerHeader/OwnerHeader";
import { PetCard } from "@/components/PetCard/PetCard";
import { HistorySection } from "@/components/HistorySection/HistorySection";
import { SectionSkeleton } from "@/components/SectionSkeleton/SectionSkeleton";
import { Skeleton } from "@/components/Skeleton/Skeleton";
import { getOwnerByIdCached } from "@/lib/data/owners";
import { NewPetButton } from "@/components/NewPetButton/NewPetButton";

// R08: streaming SSR. Header y mascotas usan "use cache" (tags owners/pets)
// y el historial streamea dentro de Suspense.
export default function OwnerPage({
  params,
}: PageProps<"/duenos/[id]">) {
  return (
    <Suspense fallback={<Skeleton lines={8} />}>
      <OwnerContent params={params} />
    </Suspense>
  );
}

async function OwnerContent({
  params,
}: Pick<PageProps<"/duenos/[id]">, "params">) {
  const { id } = await params;  // request-time API = suspension point
  if (!/^[0-9a-fA-F]{24}$/.test(id)) notFound();

  const owner = await getOwnerByIdCached(id);
  if (!owner) notFound();

  return (
    <>
      <OwnerHeader owner={owner} />
      <Suspense fallback={<SectionSkeleton title="Mascotas" />}>
        <PetCard ownerId={id} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton title="Historial de citas" />}>
        <HistorySection ownerId={id} />
      </Suspense>
      <NewPetButton ownerId={id} />
    </>
  );
}
