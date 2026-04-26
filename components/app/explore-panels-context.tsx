"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ExplorePanelId = "saved" | "notifications" | "me";

type ExplorePanelsValue = {
  active: ExplorePanelId | null;
  openPanel: (id: ExplorePanelId) => void;
  closePanel: () => void;
};

const ExplorePanelsContext = createContext<ExplorePanelsValue | null>(null);

export function ExplorePanelsProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<ExplorePanelId | null>(null);

  const openPanel = useCallback((id: ExplorePanelId) => {
    setActive(id);
  }, []);

  const closePanel = useCallback(() => {
    setActive(null);
  }, []);

  const value = useMemo(
    () => ({ active, openPanel, closePanel }),
    [active, openPanel, closePanel]
  );

  return <ExplorePanelsContext.Provider value={value}>{children}</ExplorePanelsContext.Provider>;
}

export function useExplorePanels(): ExplorePanelsValue {
  const ctx = useContext(ExplorePanelsContext);
  if (!ctx) {
    throw new Error("useExplorePanels는 ExplorePanelsProvider 안에서만 사용하세요.");
  }
  return ctx;
}

export function useExplorePanelsOptional(): ExplorePanelsValue | null {
  return useContext(ExplorePanelsContext);
}
