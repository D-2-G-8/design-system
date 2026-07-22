export { auth as middleware } from "@/auth";
// Gate app pages + server actions; EXCLUDE /api (bearer + NextAuth), static, /signin.
export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico|signin).*)"] };
