import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/lib/config";
import { loginUser, type AuthUser } from "@/services/login-service";

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
            name:
              [user.first_name, user.last_name].filter(Boolean).join(" ") ||
              user.username,
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
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      if (user) {
        const authUser = user as AuthUser & {
          accessToken: string;
          name: string;
        };

        token.accessToken = authUser.accessToken;
        token.user = {
          id: authUser.id,
          name: authUser.name,
          username: authUser.username,
          email: authUser.email,
          first_name: authUser.first_name,
          last_name: authUser.last_name,
          role: authUser.role,
          subscribed: authUser.subscribed,
          alert: authUser.alert,
          status: authUser.status,
          created_at: authUser.created_at,
          updated_at: authUser.updated_at,
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }

      session.accessToken = token.accessToken;

      return session;
    },
  },
};
