import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { Card } from "@/components/Card/Card";
import { Skeleton } from "@/components/Skeleton/Skeleton";
import { SectionSkeleton } from "@/components/SectionSkeleton/SectionSkeleton";
import { AppointmentTable } from "@/components/AppointmentTable/AppointmentTable";
import { VetEditButton } from "@/components/VetEditButton/VetEditButton";
import { VetHorarios } from "@/components/VetHorarios/VetHorarios";
import { iniciales } from "@/components/VetCard/VetCard";
import { getVetById } from "@/lib/data/vets";
import { getAppointmentsInRange } from "@/lib/data/appointments";
import { serialize } from "@/lib/models/serialized";
import { todayISO } from "@/lib/datetime";
import { dayBoundsUtc } from "@/lib/availability";
import { URL_VETS_IMAGES } from "@/lib/config";
import styles from "./page.module.css";

export default async function VetPage({
  params,
}: PageProps<"/veterinarios/[id]">) {
  return (
    <Suspense fallback={<Skeleton lines={8} />}>
      <VetContent params={params} />
    </Suspense>
  );
}

async function VetContent({
  params,
}: Pick<PageProps<"/veterinarios/[id]">, "params">) {
  const { id } = await params; // runtime API → dynamic dentro del Suspense
  if (!/^[0-9a-fA-F]{24}$/.test(id)) notFound();

  const vet = await getVetById(new ObjectId(id));
  if (!vet) notFound();

  return (
    <div className={styles.stack}>
      <Link href="/veterinarios" className={styles.back}>
        ← Veterinarios
      </Link>

      <Card className={styles.profile}>
        {vet.fotoUrl ? (
          <Image
            className={styles.avatar}
            src={`${URL_VETS_IMAGES}/${vet.fotoUrl}`}
            alt={vet.nombre}
            width={96}
            height={96}
          />
        ) : (
          <span className={styles.avatarFallback} aria-hidden="true">
            {iniciales(vet.nombre)}
          </span>
        )}
        <div className={styles.headText}>
          <h1 className={styles.nombre}>{vet.nombre}</h1>
          <p className={styles.especialidad}>{vet.especialidad}</p>
          {vet.bio ? <p className={styles.bio}>{vet.bio}</p> : null}
        </div>
        <div className={styles.actions}>
          <VetEditButton vet={serialize(vet)} />
        </div>
      </Card>

      <section>
        <h2 className={styles.sectionTitle}>Horarios de atención</h2>
        <Card>
          <VetHorarios horarios={vet.horarios} />
        </Card>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Próximos 7 días</h2>
        <Suspense fallback={<SectionSkeleton title="Cargando citas" />}>
          <VetProximas vetId={vet._id} />
        </Suspense>
      </section>
    </div>
  );
}

/** Citas del vet desde hoy hasta +7 días (hora de clínica). */
async function VetProximas({ vetId }: { vetId: ObjectId }) {
  const { start } = dayBoundsUtc(todayISO());
  const to = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  const citas = await getAppointmentsInRange(start, to, vetId);
  return <AppointmentTable citas={citas} />;
}
