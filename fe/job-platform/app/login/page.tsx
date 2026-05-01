"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<LoginFormValues>();
  const { register, handleSubmit } = form;
  const { errors } = form.formState;

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
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
            Log in to your account
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 ">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Business email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email?.message && (
                <p className="text-sm text-destructive">
                  {String(errors.email.message)}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                })}
              />
              {errors.password?.message && (
                <p className="text-sm text-destructive">
                  {String(errors.password.message)}
                </p>
              )}
            </div>

            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>
          <Separator />

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => signIn("google")}
            type="button"
          >
            <Image
              src="/googleIcon.svg"
              alt="Google icon"
              width={18}
              height={18}
              className="h-4.5 w-4.5 shrink-0"
            />
            Log in with Google
          </Button>
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          Don&apos;t have an account?&nbsp;
          <a href="#" className="font-semibold text-primary hover:underline">
            Sign up
          </a>
        </CardFooter>
      </Card>
    </main>
  );
}
