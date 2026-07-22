import { auth, signOut } from "@/auth";
import styles from "./dashboard.module.css";

export async function Header() {
  const session = await auth();
  const login = (session?.user?.name ?? session?.user?.email) as string | undefined;
  return (
    <header className={styles.appHeader}>
      <span className={styles.appTitle}>Design System Admin</span>
      {login && (
        <span className={styles.appUser}>
          {login}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/signin" });
            }}
          >
            <button type="submit" className={styles.signOut}>
              Sign out
            </button>
          </form>
        </span>
      )}
    </header>
  );
}
