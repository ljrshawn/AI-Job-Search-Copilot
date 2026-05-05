import { z } from "zod";
import { apiClient } from "@/services/api-client";

export const userRoleSchema = z.enum(["seeker", "poster"]);

export enum UserRole {
  SEEKER = "seeker",
  POSTER = "poster",
}

export const authUserSchema = z.object({
  username: z.string(),
  email: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  role: userRoleSchema.nullable(),
  subscribed: z.boolean().nullable(),
  id: z.string(),
  alert: z.boolean(),
  status: z.boolean(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const loginResponseSchema = z.object({
  user: authUserSchema,
  token: z.string(),
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;

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

export async function loginUser({
  email,
  password,
}: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    "/auth/login",
    {
      email,
      password,
    },
    { handleUnauthorized: false },
  );

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  return loginResponseSchema.parse(await response.json());
}

export async function loginWithGoogle({
  accessToken,
  idToken,
  email,
  name,
  image,
}: GoogleLoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    "/auth/google",
    {
      access_token: accessToken,
      id_token: idToken,
      email,
      name,
      image,
    },
    { handleUnauthorized: false },
  );

  if (response.status === 404) {
    throw new GoogleSignupRequiredError();
  }

  if (!response.ok) {
    throw new Error("Unable to log in with Google");
  }

  return loginResponseSchema.parse(await response.json());
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
  const response = await apiClient.post<LoginResponse>(
    "/auth/google/signup",
    {
      access_token: accessToken,
      email,
      username,
      first_name,
      last_name,
      password,
      role,
    },
    { handleUnauthorized: false },
  );

  if (!response.ok) {
    throw new Error("Unable to complete Google signup");
  }

  return loginResponseSchema.parse(await response.json());
}
