"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type AuthIntent =
  | { type: "none" }
  | { type: "likeCourse"; courseId?: string }
  | { type: "review"; courseId?: string }
  | { type: "createCourse" }
  | { type: "generic" };

type AuthUiState = {
  open: boolean;
  intent: AuthIntent;
  openAuth: (intent?: AuthIntent) => void;
  closeAuth: () => void;
};

const AuthUiContext = createContext<AuthUiState | null>(null);

export function AuthUiProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent>({ type: "none" });

  const openAuth = useCallback((next?: AuthIntent) => {
    setIntent(next ?? { type: "generic" });
    setOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setOpen(false);
    setIntent({ type: "none" });
  }, []);

  const value = useMemo<AuthUiState>(
    () => ({ open, intent, openAuth, closeAuth }),
    [open, intent, openAuth, closeAuth]
  );

  return <AuthUiContext.Provider value={value}>{children}</AuthUiContext.Provider>;
}

export function useAuthUi() {
  const ctx = useContext(AuthUiContext);
  if (!ctx) throw new Error("useAuthUi must be used within AuthUiProvider");
  return ctx;
}

