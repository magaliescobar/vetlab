import type { Service } from "@/lib/models/service";
import type { Serialized } from "@/lib/models/serialized";
import { ServiceCard } from "../ServiceCard/ServiceCard";
import styles from "./ServiceGrid.module.css";

export function ServiceGrid({ services }: { services: Serialized<Service[]> }) {
  return (
    <div className={styles.grid}>
      {services.map((service) => (
        <ServiceCard key={service._id} service={service} />
      ))}
    </div>
  );
}
