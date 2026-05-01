import { env, requireEnv } from "@/lib/config";

export type AuthUser = {
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  subscribed: boolean | null;
  id: string;
  alert: boolean;
  status: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type LoginResponse = {
  user: AuthUser;
  token: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export async function loginUser({
  email,
  password,
}: LoginCredentials): Promise<LoginResponse> {
  const apiBaseUrl = requireEnv(env.apiBaseUrl, "API_BASE_URL");

  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  return response.json();
}
