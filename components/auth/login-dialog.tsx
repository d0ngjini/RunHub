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
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <LoginForm embedInDialog />
      </DialogContent>
    </Dialog>
  );
}
