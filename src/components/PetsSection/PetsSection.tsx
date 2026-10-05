import { ObjectId } from "mongodb";
import { getPetsByOwner } from "@/lib/data/pets";
import { sleep } from "@/lib/utils";
import { formatFecha } from "@/lib/format";
import { Card } from "../Card/Card";
import { EmptyState } from "../EmptyState/EmptyState";
import styles from "./PetsSection.module.css";

/** Sección lenta e independiente del perfil (R08): streamea dentro de Suspense. */
export async function PetsSection({ ownerId }: { ownerId: string }) {
  await sleep(Number(process.env.SIMULATE_LATENCY_MS ?? 0));
  const pets = await getPetsByOwner(new ObjectId(ownerId));

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Mascotas</h2>
      {pets.length === 0 ? (
        <EmptyState title="Sin mascotas" />
      ) : (
        <div className={styles.grid}>
          {pets.map((pet) => (
            <Card key={pet._id.toHexString()} className={styles.pet}>
              <p className={styles.petNombre}>{pet.nombre}</p>
              <p className={styles.petDato}>
                {pet.especie}
                {pet.raza ? ` · ${pet.raza}` : ""}
              </p>
              {pet.fechaNacimiento ? (
                <p className={styles.petDato}>
                  Nació el {formatFecha(pet.fechaNacimiento)}
                </p>
              ) : null}
              {pet.pesoKg ? (
                <p className={styles.petDato}>{pet.pesoKg} kg</p>
              ) : null}
              {pet.notas ? (
                <p className={styles.notas}>{pet.notas}</p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
