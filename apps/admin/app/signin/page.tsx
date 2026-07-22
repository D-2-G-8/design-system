import { signIn } from "@/auth";

export default function SignIn() {
  return (
    <main style={{ padding: "4rem", maxWidth: 420, margin: "0 auto", fontFamily: "system-ui" }}>
      <h1>Design System Admin</h1>
      <p>Sign in with GitHub. Access is limited to the design-system org.</p>
      <form action={async () => { "use server"; await signIn("github", { redirectTo: "/" }); }}>
        <button type="submit">Sign in with GitHub</button>
      </form>
    </main>
  );
}
