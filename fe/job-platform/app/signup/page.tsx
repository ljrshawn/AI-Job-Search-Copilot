"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignupFormValues = {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  role: "seeker" | "poster";
};

function splitName(name?: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  const [firstName = "", ...rest] = parts;

  return {
    firstName,
    lastName: rest.join(" "),
  };
}

export default function SignupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const googleSignup = session?.googleSignup;
  const suggestedName = useMemo(
    () => splitName(googleSignup?.name),
    [googleSignup?.name],
  );

  const form = useForm<SignupFormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      password: "",
      role: "seeker",
    },
  });
  const { register, handleSubmit, setValue } = form;
  const { errors } = form.formState;

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !session?.needsSignup || !googleSignup) {
      router.push(status === "authenticated" ? "/dashboard" : "/login");
      return;
    }

    setValue("first_name", suggestedName.firstName);
    setValue("last_name", suggestedName.lastName);
    setValue("username", googleSignup.email.split("@")[0] ?? "");
  }, [
    googleSignup,
    router,
    session?.needsSignup,
    setValue,
    status,
    suggestedName,
  ]);

  const onSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    if (!googleSignup) return;

    setIsLoading(true);
    setError("");

    const result = await signIn("google-signup", {
      redirect: false,
      accessToken: googleSignup.accessToken,
      email: googleSignup.email,
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      password: data.password,
      role: data.role,
    });

    if (result?.error) {
      setError("Unable to complete signup. Check your details and try again.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <p className="animate-pulse text-sm font-medium text-muted-foreground">
          Loading session...
        </p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-2 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            AI Job Search Copilot
          </p>
          <CardTitle className="text-2xl font-bold">
            Complete your account
          </CardTitle>
          {googleSignup?.email && (
            <p className="text-sm text-muted-foreground">{googleSignup.email}</p>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  {...register("first_name", {
                    required: "First name is required",
                  })}
                />
                {errors.first_name?.message && (
                  <p className="text-sm text-destructive">
                    {String(errors.first_name.message)}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="last_name">Last name</Label>
                <Input
                  id="last_name"
                  {...register("last_name", {
                    required: "Last name is required",
                  })}
                />
                {errors.last_name?.message && (
                  <p className="text-sm text-destructive">
                    {String(errors.last_name.message)}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                })}
              />
              {errors.username?.message && (
                <p className="text-sm text-destructive">
                  {String(errors.username.message)}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              {errors.password?.message && (
                <p className="text-sm text-destructive">
                  {String(errors.password.message)}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                {...register("role")}
              >
                <option value="seeker">Job seeker</option>
                <option value="poster">Job poster</option>
              </select>
            </div>

            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Use a different account
          </button>
        </CardFooter>
      </Card>
    </main>
  );
}
