import { DefaultSession } from "next-auth";
import { AuthUser } from "@/services/login-service";

type AppUser = AuthUser & DefaultSession["user"];

declare module "next-auth" {
  interface Session {
    user: AppUser;
    accessToken?: string;
  }

  interface User extends AuthUser {
    accessToken: string;
    name?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: AppUser;
    accessToken?: string;
  }
}
