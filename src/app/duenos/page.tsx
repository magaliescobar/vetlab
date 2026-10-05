import { PageHeader } from "@/components/PageHeader/PageHeader";
import { OwnerSearchForm } from "@/components/OwnerSearchForm/OwnerSearchForm";
import { OwnerList } from "@/components/OwnerList/OwnerList";
import { Pagination } from "@/components/Pagination/Pagination";
import { NewOwnerButton } from "@/components/NewOwnerButton/NewOwnerButton";
import { searchOwners } from "@/lib/data/owners";

const PAGE_SIZE = 10;

/**
 * R07 — SSR por request; `searchParams` es la fuente de verdad
 * (leerlo ya marca la ruta como dinámica).
 */
export default async function DuenosPage({
  searchParams,
}: PageProps<"/duenos">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const pageParam = Number.parseInt(String(sp.page ?? "1"), 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const result = await searchOwners(q, page, PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="Dueños"
        description={`${result.total} registrados`}
        actions={<NewOwnerButton />}
      />
      <OwnerSearchForm q={q} />
      <OwnerList owners={result.owners} />
      <Pagination
        basePath="/duenos"
        params={q ? { q } : {}}
        page={result.page}
        totalPages={result.totalPages}
      />
    </>
  );
}
