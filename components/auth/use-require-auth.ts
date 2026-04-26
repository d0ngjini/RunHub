"use client";

import { authClient } from "@/lib/auth-client";
import { useAuthUi, type AuthIntent } from "@/components/auth/auth-store";

export function useRequireAuth() {
  const { data: session, isPending } = authClient.useSession();
  const { openAuth } = useAuthUi();

  return {
    session,
    isPending,
    requireAuth: (intent?: AuthIntent) => {
      if (isPending) return false;
      if (session?.user?.id) return true;
      openAuth(intent ?? { type: "generic" });
      return false;
    },
  };
}

