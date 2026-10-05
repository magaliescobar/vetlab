import { Skeleton } from "@/components/Skeleton/Skeleton";
import styles from "./loading.module.css";

export default function OwnerLoading() {
  return (
    <div className={styles.loading}>
      <Skeleton lines={3} />
      <Skeleton lines={5} />
    </div>
  );
}
