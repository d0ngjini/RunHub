"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
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

  const kakaoButton = (
    <FieldGroup className="gap-3">
      <Field>
        <Button
          type="button"
          className="w-full"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            try {
              await authClient.signIn.social({
                provider: "kakao",
                callbackURL: "/explore",
              });
            } finally {
              setLoading(false);
            }
          }}
        >
                {loading ? (
                  <>
                    <Spinner className="size-4 shrink-0" data-icon="inline-start" />
                    이동 중…
                  </>
                ) : (
            "카카오로 로그인"
          )}
        </Button>
        <FieldDescription className="text-center text-xs">
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
