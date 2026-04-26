"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { KakaoLoginSymbol } from "@/components/auth/kakao-symbol";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type LoginFormProps = {
  className?: string;
  title?: string;
  description?: string;
  /** 다이얼로그 내부에서 카드 외곽선 완화 */
  embedInDialog?: boolean;
};

export function LoginForm({
  className,
  title = "로그인",
  description = "카카오 계정으로만 로그인할 수 있어요.",
  embedInDialog = false,
}: LoginFormProps) {
  const [loading, setLoading] = useState(false);

  /** 카카오 로그인 버튼 디자인 가이드: 배경 #FEE500, 라벨 rgba(0,0,0,0.85), radius 12px, 심볼 필수 */
  const kakaoButton = (
    <FieldGroup className="gap-4">
      <Field>
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            const okUrl = origin ? `${origin}/explore?login=success` : "/explore?login=success";
            const errUrl = origin ? `${origin}/explore?login=error` : "/explore?login=error";
            try {
              toast.message("카카오 로그인 화면으로 이동합니다.", {
                description: "잠시만 기다려 주세요. 새 페이지로 넘어갑니다.",
                duration: 4000,
              });
              const { error } = await authClient.signIn.social({
                provider: "kakao",
                callbackURL: okUrl,
                errorCallbackURL: errUrl,
              });
              if (error) {
                toast.error(error.message ?? "로그인을 시작하지 못했습니다.");
                setLoading(false);
                return;
              }
            } catch (e) {
              toast.error(
                e instanceof Error ? e.message : "로그인 요청 중 오류가 발생했습니다."
              );
              setLoading(false);
            }
          }}
          className={cn(
            "flex h-12 w-full items-center justify-center gap-2 rounded-[12px] px-4",
            "bg-[#FEE500] text-[15px] font-medium text-[rgba(0,0,0,0.85)]",
            "transition-[background-color,opacity] duration-150",
            "hover:bg-[#FADA0A] active:bg-[#EBD300]",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
            "disabled:pointer-events-none disabled:opacity-55"
          )}
        >
          {loading ? (
            <>
              <Spinner className="size-[18px] shrink-0 text-[rgba(0,0,0,0.85)]" aria-hidden />
              <span>연결 중…</span>
            </>
          ) : (
            <>
              <KakaoLoginSymbol className="size-[22px] shrink-0 text-black" />
              <span>카카오 로그인</span>
            </>
          )}
        </button>
        <FieldDescription className="text-center text-xs text-muted-foreground">
          RunHub는 카카오 로그인만 지원합니다.
        </FieldDescription>
      </Field>
    </FieldGroup>
  );

  if (embedInDialog) {
    return <div className={cn("w-full", className)}>{kakaoButton}</div>;
  }

  return (
    <div className={cn("w-full", className)}>
      <Card className="shadow-sm">
        <CardHeader className="space-y-1.5 text-center sm:text-left">
          <CardTitle className="text-xl font-semibold tracking-tight">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{kakaoButton}</CardContent>
      </Card>
    </div>
  );
}
