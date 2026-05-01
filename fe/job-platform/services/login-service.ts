import { env, requireEnv } from "@/lib/config";

export enum UserRole {
  SEEKER = "seeker",
  POSTER = "poster",
}

export type AuthUser = {
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole | null;
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

export type GoogleLoginPayload = {
  accessToken: string;
  idToken?: string;
  email: string;
  name?: string | null;
  image?: string | null;
};

export type GoogleSignupPayload = {
  accessToken: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  role: UserRole;
};

export class GoogleSignupRequiredError extends Error {
  constructor() {
    super("Google account is not connected to an existing user");
    this.name = "GoogleSignupRequiredError";
  }
}

async function postAuth<TResponse>(path: string, body: unknown) {
  const apiBaseUrl = requireEnv(env.apiBaseUrl, "API_BASE_URL");

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return response as Response & { json(): Promise<TResponse> };
}

export async function loginUser({
  email,
  password,
}: LoginCredentials): Promise<LoginResponse> {
  const response = await postAuth<LoginResponse>("/auth/login", {
    email,
    password,
  });

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  return response.json();
}

export async function loginWithGoogle({
  accessToken,
  idToken,
  email,
  name,
  image,
}: GoogleLoginPayload): Promise<LoginResponse> {
  const response = await postAuth<LoginResponse>("/auth/google", {
    access_token: accessToken,
    id_token: idToken,
    email,
    name,
    image,
  });

  if (response.status === 404) {
    throw new GoogleSignupRequiredError();
  }

  if (!response.ok) {
    throw new Error("Unable to log in with Google");
  }

  return response.json();
}

export async function signupWithGoogle({
  accessToken,
  email,
  username,
  first_name,
  last_name,
  password,
  role,
}: GoogleSignupPayload): Promise<LoginResponse> {
  const response = await postAuth<LoginResponse>("/auth/google/signup", {
    access_token: accessToken,
    email,
    username,
    first_name,
    last_name,
    password,
    role,
  });

  if (!response.ok) {
    throw new Error("Unable to complete Google signup");
  }

  return response.json();
}
