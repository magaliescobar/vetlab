import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { DashboardFilters } from "@/components/DashboardFilters/DashboardFilters";
import { StatusCounters } from "@/components/StatusCounters/StatusCounters";
import { AppointmentTable } from "@/components/AppointmentTable/AppointmentTable";
import { Skeleton } from "@/components/Skeleton/Skeleton";
import { getAppointmentsByDate } from "@/lib/data/appointments";
import { todayISO } from "@/lib/datetime";
import type { EstadoCita } from "@/lib/models/shared";

// R06: SSR dinámico — datos frescos por request. Con cacheComponents se usa
// searchParams dentro de Suspense: el contenido renderiza por request.
const ESTADOS: EstadoCita[] = [
  "pendiente",
  "confirmada",
  "completada",
  "cancelada",
];

export default function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Turnos del día y gestión de estados."
      />
      <Suspense fallback={<Skeleton lines={8} />}>
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function DashboardContent({
  searchParams,
}: Pick<PageProps<"/dashboard">, "searchParams">) {
  const sp = await searchParams;
  const date =
    typeof sp.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.date)
      ? sp.date
      : todayISO();
  const estado = ESTADOS.find((e) => e === sp.estado);

  // Los contadores cubren TODO el día (sin el filtro de estado); la tabla sí filtra.
  const citas = await getAppointmentsByDate(date);
  const counts = Object.fromEntries(ESTADOS.map((e) => [e, 0])) as Record<
    EstadoCita,
    number
  >;
  for (const c of citas) counts[c.estado]++;
  const list = estado ? citas.filter((c) => c.estado === estado) : citas;

  return (
    <>
      <DashboardFilters date={date} estado={estado} />
      <StatusCounters counts={counts} total={citas.length} />
      <AppointmentTable citas={list} />
    </>
  );
}
