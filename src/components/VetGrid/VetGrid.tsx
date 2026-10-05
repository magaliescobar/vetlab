import type { Vet } from "@/lib/models/vet";
import type { Serialized } from "@/lib/models/serialized";
import { VetCard } from "../VetCard/VetCard";
import styles from "./VetGrid.module.css";

export function VetGrid({ vets }: { vets: Serialized<Vet[]> }) {
  return (
    <div className={styles.grid}>
      {vets.map((vet) => (
        <VetCard key={vet._id} vet={vet} />
      ))}
    </div>
  );
}
