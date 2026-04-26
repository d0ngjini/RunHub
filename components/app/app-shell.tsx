"use client";

import { type ReactNode } from "react";
import { SWRConfig } from "swr";

import { AuthUiProvider } from "../auth/auth-store";
import { LoginDialog } from "../auth/login-dialog";
import { ExplorePanelsProvider } from "@/components/app/explore-panels-context";
import { ExplorePanels } from "@/components/app/explore-panels";

const swrValue = {
  refreshInterval: 20_000,
  fetcher: (resource: RequestInfo, init: RequestInit) =>
    fetch(resource as string, init).then((res) => res.json()),
} as const;

/** 앱은 `/explore` 단일 화면이며, 나머지 기능은 모달로 처리합니다. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={swrValue}>
      <AuthUiProvider>
        <ExplorePanelsProvider>
          <div className="h-dvh min-h-0 w-full max-w-full overflow-hidden bg-background">{children}</div>
          <ExplorePanels />
          <LoginDialog />
        </ExplorePanelsProvider>
      </AuthUiProvider>
    </SWRConfig>
  );
}
