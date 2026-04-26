"use client";

import React, { useMemo } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthUi } from "@/components/auth/auth-store";
import { signOutWithFeedback } from "@/components/auth/sign-out-feedback";
import { useRouter } from "next/navigation";
import { useExplorePanelsOptional } from "@/components/app/explore-panels-context";

function initialsFromName(name: string) {
  const t = name.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}

export function AccountButton() {
  const { data: session, isPending } = authClient.useSession();
  const { openAuth } = useAuthUi();
  const router = useRouter();
  const explore = useExplorePanelsOptional();

  const userName = useMemo(() => session?.user?.name ?? "사용자", [session?.user?.name]);
  const av = useMemo(() => initialsFromName(userName), [userName]);

  if (isPending) {
    return (
      <Button variant="outline" disabled>
        <Spinner className="size-4" data-icon="inline-start" />
        로딩…
      </Button>
    );
  }

  if (!session?.user?.id) {
    return (
      <Button
        onClick={() => {
          openAuth({ type: "generic" });
        }}
      >
        로그인
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Avatar size="sm">
            <AvatarFallback>{av}</AvatarFallback>
          </Avatar>
          {userName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>RunHub</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            if (explore) {
              explore.openPanel("me");
            } else {
              router.push("/explore");
            }
          }}
        >
          내 정보
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void signOutWithFeedback({
              onAfterSignOut: () => {
                router.refresh();
              },
            });
          }}
        >
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
