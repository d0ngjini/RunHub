"use client";

import "ol/ol.css";
import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const DynamicMap = dynamic(() => import("@/app/components/map"), { ssr: false });

/** 카카오 OAuth 후 돌아왔을 때 쿼리로 결과 알림 (전체 리다이렉트라 클라이언트 상태가 리셋됨) */
function LoginReturnFeedback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const login = searchParams.get("login");
    if (login !== "success" && login !== "error") return;

    if (login === "success") {
      toast.success("로그인되었습니다.", { id: "oauth-login-result" });
    } else {
      toast.error("로그인에 실패했습니다.", {
        id: "oauth-login-result",
        description: "다시 시도하거나 잠시 후 이용해 주세요.",
      });
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("login");
    const qs = params.toString();
    router.replace(qs ? `/explore?${qs}` : "/explore", { scroll: false });
  }, [router, searchParams]);

  return null;
}

export default function ExplorePage() {
  return (
    <div className="flex h-full min-h-0 min-w-0 w-full flex-1 flex-col">
      <Suspense fallback={null}>
        <LoginReturnFeedback />
      </Suspense>
      <DynamicMap />
    </div>
  );
}

