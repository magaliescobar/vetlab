import type { Vet } from "@/lib/models/vet";
import Image from "next/image";
import Link from "next/link";
import type { Serialized } from "@/lib/models/serialized";
import { Card } from "../Card/Card";
import { VetEditButton } from "../VetEditButton/VetEditButton";
import styles from "./VetCard.module.css";
import { URL_VETS_IMAGES } from "@/lib/config";

export function iniciales(nombre: string): string {
  return nombre
    .replace(/^(Dr|Dra)\.\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

// si no tiene foto, muestra las iniciales del nombre
export function VetCard({ vet }: { vet: Serialized<Vet> }) {
  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        {vet.fotoUrl ? (
          <Image className={styles.avatar} src={`${URL_VETS_IMAGES}/${vet.fotoUrl}`} alt={vet.nombre} width={64} height={64} />
        ) : (
          <span className={styles.avatarFallback} aria-hidden="true">
            {iniciales(vet.nombre)}
          </span>
        )}
        <div>
          <h2 className={styles.nombre}>
            <Link href={`/veterinarios/${vet._id}`}>{vet.nombre}</Link>
          </h2>
          <p className={styles.especialidad}>{vet.especialidad}</p>
        </div>
      </div>
      {vet.bio ? <p className={styles.bio}>{vet.bio}</p> : null}
      <div className={styles.footer}>
        <VetEditButton vet={vet} />
      </div>
    </Card>
  );
}
