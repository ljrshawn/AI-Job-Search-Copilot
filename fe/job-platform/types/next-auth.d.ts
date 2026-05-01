import { DefaultSession } from "next-auth";
import { AuthUser } from "@/services/login-service";

type AppUser = AuthUser & DefaultSession["user"];

type GoogleSignupSession = {
  accessToken: string;
  email: string;
  name?: string | null;
  image?: string | null;
};

declare module "next-auth" {
  interface Session {
    user: AppUser;
    accessToken?: string;
    needsSignup?: boolean;
    googleSignup?: GoogleSignupSession;
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
    needsSignup?: boolean;
    googleSignup?: GoogleSignupSession;
  }
}
