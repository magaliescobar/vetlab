import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { OwnerHeader } from "@/components/OwnerHeader/OwnerHeader";
import { PetsSection } from "@/components/PetsSection/PetsSection";
import { HistorySection } from "@/components/HistorySection/HistorySection";
import { SectionSkeleton } from "@/components/SectionSkeleton/SectionSkeleton";
import { Skeleton } from "@/components/Skeleton/Skeleton";
import { getOwnerById } from "@/lib/data/owners";
import { serialize } from "@/lib/models/serialized";

// R08: streaming SSR. La página lee la DB sin searchParams → instant=false
// + connection() dentro de Suspense (si no, Next la prerenderizaría con
// datos viejos y el driver de Mongo rompería el prerender con sync IO).
export const instant = false;

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
  await connection();
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
