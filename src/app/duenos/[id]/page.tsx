import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { OwnerHeader } from "@/components/OwnerHeader/OwnerHeader";
import { PetsSection } from "@/components/PetsSection/PetsSection";
import { HistorySection } from "@/components/HistorySection/HistorySection";
import { SectionSkeleton } from "@/components/SectionSkeleton/SectionSkeleton";
import { getOwnerById } from "@/lib/data/owners";
import { serialize } from "@/lib/models/serialized";

// R08: streaming SSR. La página lee la DB sin searchParams → dynamic explícito
// (si no, Next la prerenderizaría en build con datos viejos).
export const dynamic = "force-dynamic";

export default async function OwnerPage({
  params,
}: PageProps<"/duenos/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-fA-F]{24}$/.test(id)) notFound();

  // Único await del shell: el header llega inmediato. Las secciones pesadas
  // (mascotas, historial) streamean detrás de sus propios Suspense.
  const owner = await getOwnerById(new ObjectId(id));
  if (!owner) notFound();

  return (
    <>
      <OwnerHeader owner={serialize(owner)} />
      <Suspense fallback={<SectionSkeleton title="Mascotas" />}>
        <PetsSection ownerId={id} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton title="Historial de citas" />}>
        <HistorySection ownerId={id} />
      </Suspense>
    </>
  );
}
