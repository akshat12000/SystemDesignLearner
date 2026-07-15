import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

// Third-party OAuth providers are commented out for local development.
// To enable them later, uncomment the imports and add to the providers array,
// and set AUTH_GITHUB_ID / AUTH_GITHUB_SECRET (or Google equivalents) in .env.
//
// import GitHub from "next-auth/providers/github";
// import Google from "next-auth/providers/google";
// import { PrismaAdapter } from "@auth/prisma-adapter";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // PrismaAdapter is NOT used here because Credentials provider requires JWT sessions.
  // Uncomment adapter + switch session.strategy to "database" when adding OAuth.
  // adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },    // used only on register
        action: { label: "Action", type: "text" }, // "login" | "register"
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);
        const action = String(credentials.action ?? "login");

        const existing = await prisma.user.findUnique({ where: { email } });

        if (action === "register") {
          if (existing) throw new Error("Email already registered");
          if (password.length < 6) throw new Error("Password must be at least 6 characters");
          const hashed = await bcrypt.hash(password, 12);
          const user = await prisma.user.create({
            data: {
              email,
              name: credentials.name ? String(credentials.name).trim() : email.split("@")[0],
              password: hashed,
            },
          });
          return { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin };
        }

        // Login
        if (!existing || !existing.password) {
          throw new Error("No account found with this email");
        }
        const valid = await bcrypt.compare(password, existing.password);
        if (!valid) throw new Error("Incorrect password");

        return { id: existing.id, email: existing.email, name: existing.name, isAdmin: existing.isAdmin };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        (session.user as { isAdmin?: boolean }).isAdmin = (token.isAdmin as boolean) ?? false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
