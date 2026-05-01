const getEnv = (key: string, fallback = "") => process.env[key] ?? fallback;

export const env = {
  apiBaseUrl:
    getEnv("API_BASE_URL") || getEnv("NEXT_PUBLIC_API_BASE_URL"),
  google: {
    clientId: getEnv("GOOGLE_CLIENT_ID"),
    clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
  },
  nextAuth: {
    url: getEnv("NEXTAUTH_URL"),
    secret: getEnv("NEXTAUTH_SECRET"),
  },
} as const;

export function requireEnv(value: string, key: string) {
  if (!value) {
    throw new Error(`Missing ${key} environment variable`);
  }

  return value;
}
