import Link from "next/link";
import type { Owner } from "@/lib/models/owner";
import type { Serialized } from "@/lib/models/serialized";
import { EmptyState } from "../EmptyState/EmptyState";
import styles from "./OwnerList.module.css";

export function OwnerList({ owners }: { owners: Serialized<Owner[]> }) {
  if (owners.length === 0) {
    return (
      <EmptyState
        title="Sin resultados"
        description="Probá con otro término de búsqueda."
      />
    );
  }
  return (
    <ul className={styles.list}>
      {owners.map((owner) => (
        <li key={owner._id}>
          <Link href={`/duenos/${owner._id}`} className={styles.row}>
            <span className={styles.nombre}>
              {owner.apellido}, {owner.nombre}
            </span>
            <span className={styles.contacto}>{owner.email}</span>
            <span className={styles.contacto}>{owner.telefono}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
