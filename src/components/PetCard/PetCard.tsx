import { getPetsByOwnerCached } from "@/lib/data/pets";
import { sleep } from "@/lib/utils";
import { formatFecha } from "@/lib/format";
import { Card } from "../Card/Card";
import { EmptyState } from "../EmptyState/EmptyState";
import { PetEditButton } from "../PetEditButton/PetEditButton";
import styles from "./PetCard.module.css";
import Image from "next/image";
import { URL_PETS_IMAGES } from "@/lib/config";

/** streamea dentro de Suspense. */
export async function PetCard({ ownerId }: { ownerId: string }) {
  await sleep(Number(process.env.SIMULATE_LATENCY_MS ?? 0));
  const pets = await getPetsByOwnerCached(ownerId);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Mascotas</h2>
      {pets.length === 0 ? (
        <EmptyState title="Sin mascotas" />
      ) : (
        <div className={styles.grid}>
          {pets.map((pet) => (
            <Card key={pet._id} className={styles.pet}>
              <p className={styles.petNombre}>{pet.nombre}</p>
              {pet.fotoUrl ? (
                <Image className={styles.avatar} src={`${URL_PETS_IMAGES}/${pet.fotoUrl}`} alt={pet.nombre} width={100} height={100} />
              ) : null}
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
              <div className={styles.footer}>
                <PetEditButton pet={pet} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
