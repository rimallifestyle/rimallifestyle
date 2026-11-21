"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserSyncProvider } from "@/context/UserSync";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <UserSyncProvider>{children}</UserSyncProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
