import type { Owner } from "@/lib/models/owner";
import type { Serialized } from "@/lib/models/serialized";
import { formatFecha } from "@/lib/format";
import { Card } from "../Card/Card";
import styles from "./OwnerHeader.module.css";

export function OwnerHeader({ owner }: { owner: Serialized<Owner> }) {
  return (
    <Card className={styles.header}>
      <h1 className={styles.nombre}>
        {owner.nombre} {owner.apellido}
      </h1>
      <dl className={styles.datos}>
        <div>
          <dt>Email</dt>
          <dd>{owner.email}</dd>
        </div>
        <div>
          <dt>Teléfono</dt>
          <dd>{owner.telefono}</dd>
        </div>
        {owner.direccion ? (
          <div>
            <dt>Dirección</dt>
            <dd>{owner.direccion}</dd>
          </div>
        ) : null}
        <div>
          <dt>Registrado</dt>
          <dd>{formatFecha(owner.createdAt)}</dd>
        </div>
      </dl>
    </Card>
  );
}
