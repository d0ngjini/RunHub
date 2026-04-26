"use client";

import useSWR from "swr";
import Link from "next/link";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { SWR_FEED } from "@/lib/swr-keys";
import { FeedComposer } from "@/components/feed/feed-composer";
import { FeedPostCard, type FeedPostRow } from "@/components/feed/feed-post-card";

const swrJson = (url: string) => fetch(url).then((r) => r.json());

export function FeedView() {
  const { data, isLoading, error } = useSWR<{
    status: number;
    content?: FeedPostRow[];
  }>(SWR_FEED, swrJson, { revalidateOnFocus: true, dedupingInterval: 3_000 });

  const list = data?.content ?? [];
  const ok = !error && data?.status === 200;

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      <header className="shrink-0 border-b border-border/80 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2 sm:max-w-2xl">
          <h1 className="text-base font-semibold text-foreground sm:text-lg">러닝 피드</h1>
          <Button type="button" variant="secondary" size="sm" asChild>
            <Link href="/explore" className="inline-flex items-center gap-1.5">
              <Map className="size-4" aria-hidden />
              지도
            </Link>
          </Button>
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg space-y-4 p-4 pb-10 sm:max-w-2xl">
          <p className="text-sm leading-relaxed text-foreground/80">
            코스와 무관한 러닝·건강 이야기를 나누는 곳이에요.
          </p>
          <FeedComposer />
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          )}
          {ok && list.length === 0 && !isLoading ? (
            <Empty className="min-h-32 border border-dashed border-border/80 bg-muted/20 py-8">
              <EmptyHeader>
                <EmptyTitle className="text-sm font-normal text-foreground/75">
                  첫 글을 올려 보세요
                </EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : null}
          {ok && list.length > 0 && (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {list.map((p) => (
                <li key={p.id}>
                  <FeedPostCard post={p} />
                </li>
              ))}
            </ul>
          )}
          {error ? (
            <p className="text-center text-sm text-destructive">불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
