import type { Vet } from "@/lib/models/vet";
import type { Serialized } from "@/lib/models/serialized";
import { Card } from "../Card/Card";
import { VetEditButton } from "../VetEditButton/VetEditButton";
import styles from "./VetCard.module.css";

function iniciales(nombre: string): string {
  return nombre
    .replace(/^(Dr|Dra)\.\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function VetCard({ vet }: { vet: Serialized<Vet> }) {
  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        {vet.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- foto local en /public, sin optimización necesaria
          <img className={styles.avatar} src={vet.fotoUrl} alt={vet.nombre} />
        ) : (
          <span className={styles.avatarFallback} aria-hidden="true">
            {iniciales(vet.nombre)}
          </span>
        )}
        <div>
          <h2 className={styles.nombre}>{vet.nombre}</h2>
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
