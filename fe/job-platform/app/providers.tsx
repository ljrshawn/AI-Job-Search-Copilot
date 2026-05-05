"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { API_UNAUTHORIZED_EVENT } from "@/services/api-client";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const isSigningOutRef = useRef(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    const handleUnauthorized = () => {
      if (isSigningOutRef.current) return;

      isSigningOutRef.current = true;
      queryClient.clear();
      signOut({ callbackUrl: "/login" });
    };

    window.addEventListener(API_UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(API_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [queryClient]);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
