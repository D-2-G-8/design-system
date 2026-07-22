import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isAllowedGitHubUser, parseAllowlist } from "@/lib/auth-policy";

const ORG = process.env.ADMIN_ORG || (process.env.GITHUB_DESIGN_SYSTEM_REPO?.split("/")[0] ?? "");

async function isOrgMember(login: string, token: string): Promise<boolean> {
  if (!ORG) return false;
  const res = await fetch(`https://api.github.com/orgs/${ORG}/members/${login}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
  });
  return res.status === 204; // 204 = member, 404 = not
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/signin" },
  providers: [GitHub({ authorization: { params: { scope: "read:org read:user user:email" } } })],
  callbacks: {
    // Gate every middleware-matched request: NextAuth v5's `authorized` defaults
    // to `true`, so WITHOUT this the middleware (export { auth as middleware })
    // enforces nothing and the app is reachable anonymously. `signIn` only gates
    // whether a session is ever CREATED (the OAuth handshake); `authorized` is
    // what forces an existing session on each request → redirect to /signin.
    authorized: ({ auth }) => !!auth?.user,
    async signIn({ profile, account }) {
      const login = (profile as { login?: string } | null)?.login;
      const token = account?.access_token;
      if (!login || !token) return false;
      const allowlist = parseAllowlist(process.env.ADMIN_GITHUB_USERS);
      const member = allowlist ? false : await isOrgMember(login, token);
      return isAllowedGitHubUser(login, { allowlist, isOrgMember: member });
    },
  },
});
