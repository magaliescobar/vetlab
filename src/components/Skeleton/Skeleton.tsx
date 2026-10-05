import clsx from "clsx";
import styles from "./Skeleton.module.css";

export function Skeleton({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={clsx(styles.group, className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className={styles.block} />
      ))}
    </div>
  );
}
