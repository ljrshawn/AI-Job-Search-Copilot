import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/lib/config";
import {
  GoogleSignupRequiredError,
  loginUser,
  loginWithGoogle,
  signupWithGoogle,
  UserRole,
  type AuthUser,
} from "@/services/login-service";

function getDisplayName(
  user: Pick<AuthUser, "first_name" | "last_name" | "username">,
) {
  return (
    [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
  );
}

function getSessionUser(user: AuthUser & { name?: string }) {
  return {
    id: user.id,
    name: user.name || getDisplayName(user),
    username: user.username,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    subscribed: user.subscribed,
    alert: user.alert,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.google.clientId,
      clientSecret: env.google.clientSecret,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        try {
          const { user, token } = await loginUser({
            email: credentials.email,
            password: credentials.password,
          });

          return {
            ...user,
            name: getDisplayName(user),
            accessToken: token,
          };
        } catch {
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "google-signup",
      name: "Google Signup",
      credentials: {
        accessToken: { label: "Google access token", type: "text" },
        email: { label: "Email", type: "email" },
        username: { label: "Username", type: "text" },
        first_name: { label: "First name", type: "text" },
        last_name: { label: "Last name", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (
          !credentials?.accessToken ||
          !credentials.email ||
          !credentials.username ||
          !credentials.password ||
          (credentials.role !== UserRole.SEEKER &&
            credentials.role !== UserRole.POSTER)
        ) {
          return null;
        }

        try {
          const { user, token } = await signupWithGoogle({
            accessToken: credentials.accessToken,
            email: credentials.email,
            username: credentials.username,
            first_name: credentials.first_name ?? "",
            last_name: credentials.last_name ?? "",
            password: credentials.password,
            role: credentials.role,
          });

          return {
            ...user,
            name: getDisplayName(user),
            accessToken: token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: env.nextAuth.secret,
  callbacks: {
    async jwt({ token, account, user }) {
      if (
        account?.provider === "google" &&
        account.access_token &&
        user?.email
      ) {
        try {
          const response = await loginWithGoogle({
            accessToken: account.access_token,
            idToken: account.id_token,
            email: user.email,
            name: user.name,
            image: user.image,
          });

          token.accessToken = response.token;
          token.user = getSessionUser({
            ...response.user,
            name: getDisplayName(response.user),
          });
          token.needsSignup = false;
          token.googleSignup = undefined;
          return token;
        } catch (error) {
          if (error instanceof GoogleSignupRequiredError) {
            token.accessToken = undefined;
            token.user = undefined;
            token.needsSignup = true;
            token.googleSignup = {
              accessToken: account.access_token,
              email: user.email,
              name: user.name,
              image: user.image,
            };
            return token;
          }

          throw error;
        }
      }

      if (user) {
        const authUser = user as AuthUser & {
          accessToken: string;
          name?: string;
        };

        token.accessToken = authUser.accessToken;
        token.user = getSessionUser(authUser);
        token.needsSignup = false;
        token.googleSignup = undefined;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }

      session.accessToken = token.accessToken;
      session.needsSignup = token.needsSignup;
      session.googleSignup = token.googleSignup;

      return session;
    },
  },
};
