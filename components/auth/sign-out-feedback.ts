"use client";

import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export type SignOutFeedbackOptions = {
  /** 기본 문구: "로그아웃했습니다." */
  successMessage?: string;
  /** 세션 제거 직후 실행(패널 닫기·router.refresh 등) */
  onAfterSignOut?: () => void | Promise<void>;
};

/**
 * 로그아웃 시 로딩·성공·실패를 토스트로 알립니다.
 */
export async function signOutWithFeedback(options?: SignOutFeedbackOptions): Promise<void> {
  const successMessage = options?.successMessage ?? "로그아웃했습니다.";
  toast.loading("로그아웃하는 중…", { id: "auth-sign-out" });

  try {
    const result = await authClient.signOut();
    toast.dismiss("auth-sign-out");

    if (result && typeof result === "object" && "error" in result && result.error) {
      const err = result.error as { message?: string };
      toast.error(err.message ?? "로그아웃에 실패했습니다.", { id: "auth-sign-out-result" });
      return;
    }

    await options?.onAfterSignOut?.();
    toast.success(successMessage, { id: "auth-sign-out-result" });
  } catch (e) {
    toast.dismiss("auth-sign-out");
    toast.error(e instanceof Error ? e.message : "로그아웃 중 오류가 발생했습니다.", {
      id: "auth-sign-out-result",
    });
  }
}
