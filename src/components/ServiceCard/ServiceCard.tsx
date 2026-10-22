import type { Service } from "@/lib/models/service";
import type { Serialized } from "@/lib/models/serialized";
import { Card } from "../Card/Card";
import { ServiceEditButton } from "../ServiceEditButton/ServiceEditButton";
import styles from "./ServiceCard.module.css";

export function ServiceCard({ service }: { service: Serialized<Service> }) {
  const inactivo = service.activo === false;
  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.nombre}>{service.nombre}</h2>
        {inactivo ? <span className={styles.inactivo}>Inactivo</span> : null}
      </div>
      {service.descripcion ? (
        <p className={styles.descripcion}>{service.descripcion}</p>
      ) : null}
      <p className={styles.detalles}>
        {service.duracionMin} min · ${service.precio}
      </p>
      <div className={styles.footer}>
        <ServiceEditButton service={service} />
      </div>
    </Card>
  );
}
