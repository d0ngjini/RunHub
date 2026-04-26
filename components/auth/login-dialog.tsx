"use client";

import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthUi } from "@/components/auth/auth-store";
import { LoginForm } from "@/components/login-form";
import type { AuthIntent } from "@/components/auth/auth-store";

function titleForIntent(i: AuthIntent) {
  switch (i.type) {
    case "review":
      return "리뷰를 남기려면 로그인";
    case "likeCourse":
      return "로그인 후 추천";
    case "createCourse":
      return "코스를 만들려면 로그인";
    default:
      return "RunHub 로그인";
  }
}

function descForIntent(i: AuthIntent) {
  switch (i.type) {
    case "review":
      return "로그인하면 리뷰를 작성할 수 있어요.";
    case "likeCourse":
      return "로그인하면 추천·북마크를 사용할 수 있어요.";
    case "createCourse":
      return "로그인하면 코스를 저장·관리할 수 있어요.";
    default:
      return "카카오톡으로 바로 이어갈 수 있어요.";
  }
}

export function LoginDialog() {
  const { open, intent, closeAuth } = useAuthUi();

  const title = useMemo(() => titleForIntent(intent), [intent]);
  const description = useMemo(() => descForIntent(intent), [intent]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeAuth()}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(90dvh,640px)] min-h-[min(72dvh,480px)] w-full max-w-[calc(100%-2rem)] flex-col gap-8 p-6 pt-8 sm:max-w-md sm:p-8 sm:pt-10"
      >
        <DialogHeader className="shrink-0 space-y-3 text-left">
          <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
          <DialogDescription className="text-base leading-relaxed">{description}</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col justify-center pb-2">
          <LoginForm embedInDialog />
        </div>
      </DialogContent>
    </Dialog>
  );
}
