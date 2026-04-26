"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ExplorePanelId = "saved" | "notifications" | "me";

export type MeSubTab = "profile" | "account";

type OpenOptions = { meTab?: MeSubTab };

type ExplorePanelsValue = {
  active: ExplorePanelId | null;
  meTab: MeSubTab;
  openPanel: (id: ExplorePanelId, options?: OpenOptions) => void;
  closePanel: () => void;
  setMeTab: (t: MeSubTab) => void;
};

const ExplorePanelsContext = createContext<ExplorePanelsValue | null>(null);

export function ExplorePanelsProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<ExplorePanelId | null>(null);
  const [meTab, setMeTab] = useState<MeSubTab>("profile");

  const openPanel = useCallback((id: ExplorePanelId, options?: OpenOptions) => {
    setActive(id);
    if (id === "me") {
      setMeTab(options?.meTab ?? "profile");
    }
  }, []);

  const closePanel = useCallback(() => {
    setActive(null);
  }, []);

  const value = useMemo(
    () => ({ active, meTab, openPanel, closePanel, setMeTab }),
    [active, meTab, openPanel, closePanel]
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
