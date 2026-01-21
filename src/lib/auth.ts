import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import type { Adapter } from "next-auth/adapters";
import { authConfig } from "./auth.config";

const ADMIN_EMAILS = [
  "ffelixrichardo@gmail.com",
  "odipintar@gmail.com",
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    ...authConfig.callbacks,
    // Add logic to force ADMIN role in token for admin emails to ensure immediate effect
    async jwt({ token, user }) {
      // Call parent jwt if needed, or just implemented merged logic
      if (user) {
        token.id = user.id;
        token.role = user.role;
        
        // Immediate admin check for hardcoded emails
        if (user.email && ADMIN_EMAILS.includes(user.email)) {
             token.role = "ADMIN";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user }) {
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        try {
           const existingUser = await prisma.user.findUnique({ where: { email: user.email }});
           if (existingUser) {
             await prisma.user.update({
               where: { email: user.email },
               data: { role: "ADMIN" },
             });
           }
        } catch (e) {
          console.error("Error updating admin role on signin", e);
        }
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        await prisma.user.update({
          where: { email: user.email },
          data: { role: "ADMIN" },
        });
      }
    },
  },
});
