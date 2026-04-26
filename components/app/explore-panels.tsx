"use client";

import { FlaskConical, RefreshCw } from "lucide-react";
import useSWR from "swr";

import { MePanel } from "@/components/app/me-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAuth } from "@/components/auth/use-require-auth";
import { cn } from "@/lib/utils";

import { useExplorePanels, type ExplorePanelId } from "@/components/app/explore-panels-context";

const swrJson = (url: string) => fetch(url).then((r) => r.json());

const titles: Record<ExplorePanelId, string> = {
  saved: "저장된 코스",
  notifications: "알림",
  me: "내 정보",
};

type SwrBundle = {
  data: unknown;
  isLoading: boolean;
  mutate: () => void;
};

function SavedPanel({
  saved,
}: {
  saved: SwrBundle;
}) {
  const { requireAuth } = useRequireAuth();
  const { data, isLoading, mutate } = saved;

  return (
    <div className="flex w-full flex-col gap-0">
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2 py-0.5">
              <Skeleton className="h-5 w-2/3 rounded-md" />
              <Skeleton className="h-4 w-full max-w-sm rounded-md" />
            </div>
          ))}
        </div>
      ) : (data as { status?: number })?.status === 401 ? (
        <Empty className="min-h-28 border-0 bg-transparent py-6 shadow-none">
          <EmptyHeader>
            <EmptyTitle>로그인이 필요합니다</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : Array.isArray((data as { content?: unknown })?.content) &&
        (data as { content: unknown[] }).content.length === 0 ? (
        <Empty className="min-h-28 border-0 bg-transparent py-6 shadow-none">
          <EmptyHeader>
            <EmptyTitle>저장된 코스가 없습니다</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-0 p-0">
          {((data as {
            content: Array<{
              savedId: string;
              course?: { id?: string; name?: string; description?: string };
            }>;
          }).content ?? []).map((row) => (
            <li
              key={row.savedId}
              className="group flex items-start justify-between gap-3 rounded-xl py-2.5 -mx-1 px-1 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground leading-snug">
                  {row.course?.name ?? "코스"}
                </p>
                {row.course?.description ? (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{row.course.description}</p>
                ) : null}
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="shrink-0 text-xs text-muted-foreground group-hover:text-foreground"
                onClick={async () => {
                  if (!requireAuth({ type: "generic" })) return;
                  await fetch("/api/saved", {
                    method: "POST",
                    body: JSON.stringify({ courseId: row.course?.id }),
                  });
                  void mutate();
                }}
              >
                해제
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NotificationsPanel({ notif }: { notif: SwrBundle }) {
  const { data, isLoading, mutate } = notif;

  return (
    <div className="flex w-full flex-col gap-0">
      {isLoading ? (
        <div className="grid gap-2">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-3 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (data as { status?: number })?.status === 401 ? (
        <Empty className="min-h-32 border-0 bg-transparent py-8">
          <EmptyHeader>
            <EmptyTitle>로그인이 필요합니다</EmptyTitle>
            <EmptyDescription>알림을 보려면 로그인해 주세요.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : Array.isArray((data as { content?: unknown })?.content) &&
        (data as { content: unknown[] }).content.length === 0 ? (
        <Empty className="min-h-32 border-0 bg-transparent py-8">
          <EmptyHeader>
            <EmptyTitle>알림이 없습니다</EmptyTitle>
            <EmptyDescription>새 소식이 생기면 여기에 표시됩니다.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-2">
          {(
            (data as { content: Array<{ id: string; type: string; title: string; body?: string | null }> })
              .content ?? []
          ).map((n) => (
            <Card key={n.id}>
              <CardHeader className="gap-1">
                <Badge variant="outline" className="w-fit">
                  {n.type}
                </Badge>
                <CardTitle className="text-base">{n.title}</CardTitle>
                {n.body ? <CardDescription>{n.body}</CardDescription> : null}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PanelBody({
  id,
  saved,
  notif,
}: {
  id: ExplorePanelId;
  saved: SwrBundle;
  notif: SwrBundle;
}) {
  if (id === "saved") return <SavedPanel saved={saved} />;
  if (id === "notifications") return <NotificationsPanel notif={notif} />;
  return <MePanel />;
}

export function ExplorePanels() {
  const { active, closePanel } = useExplorePanels();
  const { requireAuth } = useRequireAuth();
  const open = active !== null;

  const savedSwr = useSWR(open && active === "saved" ? "/api/saved" : null, swrJson);
  const notifSwr = useSWR(open && active === "notifications" ? "/api/notifications" : null, swrJson);

  const savedBundle: SwrBundle = {
    data: savedSwr.data,
    isLoading: savedSwr.isLoading,
    mutate: () => {
      void savedSwr.mutate();
    },
  };
  const notifBundle: SwrBundle = {
    data: notifSwr.data,
    isLoading: notifSwr.isLoading,
    mutate: () => {
      void notifSwr.mutate();
    },
  };

  const onNotifTest = async () => {
    if (!requireAuth({ type: "generic" })) return;
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "system",
        title: "테스트 알림",
        body: "알림 UI/DB 연결이 정상입니다.",
      }),
    });
    void notifSwr.mutate();
  };

  const onRefreshSaved = () => {
    if (!requireAuth({ type: "generic" })) return;
    void savedSwr.mutate();
  };
  const onRefreshNotif = () => {
    if (!requireAuth({ type: "generic" })) return;
    void notifSwr.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closePanel()}>
      <DialogContent
        className={cn(
          "flex max-h-[min(88dvh,640px)] w-full max-w-md flex-col gap-0 overflow-hidden p-0 sm:max-w-md",
          active === "me" && "min-h-[min(56dvh,480px)]"
        )}
        showCloseButton
      >
        {active && (
          <>
            <DialogHeader
              className={cn(
                "shrink-0 space-y-0 border-0 px-4 py-3 pr-12 text-left sm:px-5 sm:py-3.5 sm:pr-12",
                "flex flex-row items-center gap-2"
              )}
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                {active === "me" ? (
                  <>
                    <DialogTitle className="text-base sm:text-lg">내 정보</DialogTitle>
                    <DialogDescription className="sr-only">프로필과 계정</DialogDescription>
                  </>
                ) : (
                  <>
                    <DialogTitle className="text-base leading-tight sm:text-lg">
                      {titles[active]}
                    </DialogTitle>
                    {active === "notifications" ? (
                      <DialogDescription className="sr-only">알림 목록</DialogDescription>
                    ) : null}
                  </>
                )}
              </div>
              {active === "saved" && (
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    onClick={onRefreshSaved}
                    title="새로고침"
                    aria-label="목록 새로고침"
                  >
                    <RefreshCw className="size-4" aria-hidden />
                  </Button>
                </div>
              )}
              {active === "notifications" && (
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    onClick={onNotifTest}
                    title="테스트 알림"
                    aria-label="테스트 알림 생성"
                  >
                    <FlaskConical className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    onClick={onRefreshNotif}
                    title="새로고침"
                    aria-label="알림 새로고침"
                  >
                    <RefreshCw className="size-4" aria-hidden />
                  </Button>
                </div>
              )}
            </DialogHeader>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-1 sm:px-5 sm:pt-2",
                active === "me" && "pb-5 pt-2 sm:pb-6 sm:pt-3"
              )}
            >
              {active && (
                <PanelBody id={active} saved={savedBundle} notif={notifBundle} />
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
