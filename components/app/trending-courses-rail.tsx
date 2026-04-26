"use client";

import useSWR from "swr";
import { SWR_COURSES_TRENDING } from "@/lib/swr-keys";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

type TrendingItem = {
  rank: number;
  id: string;
  name: string;
  description: string;
  likeCount: number;
  saveCount: number;
  ratingCount: number;
  avgRating: number;
};

async function fetcher(url: string) {
  const r = await fetch(url);
  const text = await r.text();
  if (!r.ok) {
    throw new Error(text || r.statusText || "trending failed");
  }
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

type TrendingCoursesRailProps = {
  onPickCourse: (id: string, name: string) => void;
};

const surface = cn(
  "w-[min(100vw-1rem,272px)] overflow-hidden rounded-xl border border-border/80 bg-popover/95 text-popover-foreground",
  "shadow-lg ring-1 ring-foreground/10 backdrop-blur-xl supports-[backdrop-filter]:bg-popover/88"
);

export function TrendingCoursesRail({ onPickCourse }: TrendingCoursesRailProps) {
  const { data, isLoading } = useSWR(SWR_COURSES_TRENDING, fetcher, {
    refreshInterval: 60_000,
    dedupingInterval: 5_000,
  });

  const items: TrendingItem[] = Array.isArray(data?.content) ? data.content : [];

  return (
    <div className="pointer-events-auto ml-auto flex w-max min-w-0 max-w-full flex-col">
        {isLoading ? (
          <div className={cn("flex flex-col", surface)}>
            <div className="border-b border-border/60 px-3 py-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 shrink-0 rounded-md" />
                <Skeleton className="h-4 min-w-0 flex-1 max-w-[11rem] rounded-md" />
              </div>
            </div>
            <ul className="divide-y divide-border/50 p-0">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <Skeleton className="h-3 w-2.5 rounded-sm" />
                  <Skeleton className="h-3.5 min-w-0 flex-1 rounded-sm" />
                  <Skeleton className="h-3 w-6 rounded-sm" />
                </li>
              ))}
            </ul>
          </div>
        ) : items.length === 0 ? (
          <Empty
            className={cn(
              "min-h-0 w-[min(100vw-1rem,272px)] flex-col rounded-xl border border-dashed border-border/80",
              "bg-popover/90 py-3 px-3 text-popover-foreground shadow-md ring-1 ring-foreground/10 backdrop-blur-md",
              "supports-[backdrop-filter]:bg-popover/85"
            )}
            role="status"
          >
            <EmptyHeader className="w-full max-w-full gap-0.5 text-left">
              <EmptyTitle className="text-xs font-normal text-muted-foreground">
                급상승 코스가 아직 없어요
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className={cn("flex max-h-[min(42dvh,300px)] flex-col", surface)}>
            <div className="shrink-0 border-b border-border/60 px-3 py-3">
              <div
                className="flex min-w-0 items-center gap-2"
                title="추천·북마크·별점을 반영한 순위입니다"
              >
                <Flame
                  className="size-4 shrink-0 text-primary"
                  strokeWidth={2}
                  aria-hidden
                />
                <p className="min-w-0 text-sm font-semibold leading-snug tracking-tight text-foreground">
                  급상승 코스 순위
                </p>
              </div>
            </div>
            <ul
              className="min-h-0 flex-1 divide-y divide-border/50 overflow-y-auto overscroll-contain [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/25"
            >
              {items.map((c) => (
                <li key={c.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => onPickCourse(c.id, c.name)}
                    className={cn(
                      "flex w-full min-w-0 items-baseline gap-2.5 px-3 py-2.5 text-left",
                      "transition-[background-color] duration-150",
                      "hover:bg-muted/55 active:bg-muted/75"
                    )}
                  >
                    <span
                      className="w-4 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground"
                      aria-label={`${c.rank}위`}
                    >
                      {c.rank}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-normal leading-snug tracking-tight text-foreground">
                      {c.name}
                    </span>
                    <span
                      className="shrink-0 text-[10px] tabular-nums text-muted-foreground"
                      title="평균 별점"
                    >
                      {c.ratingCount > 0 ? c.avgRating.toFixed(1) : "—"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}
