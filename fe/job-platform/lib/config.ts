export const env = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? "",
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  },
  nextAuth: {
    url: process.env.NEXTAUTH_URL ?? "",
    secret: process.env.NEXTAUTH_SECRET ?? "",
  },
} as const;

export function requireEnv(value: string, key: string) {
  if (!value) {
    throw new Error(`Missing ${key} environment variable`);
  }

  return value;
}
