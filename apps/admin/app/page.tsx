// Status page. Phase 1: skeleton only -- no generation UI yet (that's a
// later phase). This just confirms the app deployed and is reachable.
export default function Home() {
  return (
    <main style={{ padding: "3rem", maxWidth: 640, margin: "0 auto" }}>
      <h1>Design System Admin — up</h1>
      <p>
        This admin triggers and monitors design-system component generation.
        Generation itself runs as a GitHub Actions workflow, not in this app.
      </p>
    </main>
  );
}
