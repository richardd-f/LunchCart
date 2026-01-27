import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      hasShopRole: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    hasShopRole?: boolean;
  }
}
