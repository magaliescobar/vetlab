import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "@/lib/actions";
import { Button } from "../Button/Button";
import styles from "./AuthButton.module.css";

/** Login/logout según la sesión activa. Renderizar dentro de <Suspense>. */
export async function AuthButton() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Link href="/login" className={styles.loginLink}>
        Iniciar sesión
      </Link>
    );
  }

  return (
    <form action={logout} className={styles.logoutForm}>
      <span className={styles.userName}>{session.user.name}</span>
      <Button type="submit" variant="ghost">
        Cerrar sesión
      </Button>
    </form>
  );
}
