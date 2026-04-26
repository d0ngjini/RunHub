"use client";

import useSWR from "swr";
import Link from "next/link";
import { SWR_FEED_MAP_WIDGET } from "@/lib/swr-keys";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronRight, MessagesSquare } from "lucide-react";

type FeedItem = {
  id: string;
  title: string;
  authorName: string | null;
};

const surface = cn(
  "w-[min(100vw-1rem,272px)] overflow-hidden rounded-xl border border-border/80 bg-popover/95 text-popover-foreground",
  "shadow-lg ring-1 ring-foreground/10 backdrop-blur-xl supports-[backdrop-filter]:bg-popover/88"
);

async function fetcher(url: string) {
  const r = await fetch(url);
  const text = await r.text();
  if (!r.ok) throw new Error(text || r.statusText || "feed failed");
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function FeedSnapshotRail() {
  const { data, isLoading } = useSWR(SWR_FEED_MAP_WIDGET, fetcher, {
    refreshInterval: 60_000,
    dedupingInterval: 5_000,
  });

  const list: FeedItem[] = (
    (Array.isArray(data?.content) ? data?.content : []) as Array<{
      id: string;
      title: string;
      authorName: string | null;
    }>
  ).map((r) => ({
    id: r.id,
    title: r.title,
    authorName: r.authorName,
  }));

  return (
    <div className="pointer-events-auto ml-auto flex w-max min-w-0 max-w-full flex-col">
      {isLoading ? (
        <div className={cn("flex max-h-[min(28dvh,200px)] flex-col", surface)}>
          <div className="shrink-0 border-b border-border/60 px-3 py-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 shrink-0 rounded-md" />
              <Skeleton className="h-4 min-w-0 flex-1 max-w-[9rem] rounded-md" />
            </div>
          </div>
          <ul className="m-0 flex list-none flex-col divide-y divide-border/50 p-0">
            {[0, 1, 2].map((i) => (
              <li key={i} className="px-3 py-2.5">
                <Skeleton className="h-3.5 w-full max-w-[200px] rounded-sm" />
              </li>
            ))}
          </ul>
        </div>
      ) : list.length === 0 ? (
        <Empty
          className={cn(
            "min-h-0 w-[min(100vw-1rem,272px)] flex-col rounded-xl border border-dashed border-border/80",
            "bg-popover/90 py-3 px-3 text-popover-foreground shadow-md ring-1 ring-foreground/10 backdrop-blur-md",
            "supports-[backdrop-filter]:bg-popover/85"
          )}
          role="status"
        >
          <EmptyHeader className="w-full max-w-full gap-0.5 text-left">
            <EmptyTitle className="text-xs font-normal text-muted-foreground">아직 피드 글이 없어요</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className={cn("flex max-h-[min(28dvh,200px)] flex-col", surface)}>
          <div className="shrink-0 border-b border-border/60 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <MessagesSquare
                  className="size-4 shrink-0 text-primary"
                  strokeWidth={2}
                  aria-hidden
                />
                <p className="min-w-0 text-sm font-semibold leading-snug tracking-tight text-foreground">
                  러닝 피드
                </p>
              </div>
            </div>
          </div>
          <ul
            className="m-0 min-h-0 flex-1 list-none divide-y divide-border/50 overflow-y-auto overflow-x-hidden overscroll-contain p-0 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/25"
            aria-label="최신 피드"
          >
            {list.map((p) => (
              <li key={p.id} className="min-w-0">
                <p className="w-full min-w-0 px-3 py-2.5 text-left text-[12px] font-normal leading-snug tracking-tight text-foreground">
                  <span className="line-clamp-2 break-words">{p.title}</span>
                  {p.authorName ? (
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">{p.authorName}</span>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
          <div className="shrink-0 border-t border-border/60">
            <Link
              href="/feed"
              className="flex w-full items-center justify-center gap-1 py-2 text-[11px] font-medium text-muted-foreground transition-[color,background] hover:bg-muted/50 hover:text-foreground"
            >
              피드 열기
              <ChevronRight className="size-3.5 opacity-70" aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
