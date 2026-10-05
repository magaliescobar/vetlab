import { Skeleton } from "../Skeleton/Skeleton";
import styles from "./SectionSkeleton.module.css";

export function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className={styles.section} aria-busy="true">
      <h2 className={styles.title}>{title}</h2>
      <Skeleton lines={4} />
    </section>
  );
}
