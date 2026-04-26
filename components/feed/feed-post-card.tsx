"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRequireAuth } from "@/components/auth/use-require-auth";
import { SWR_FEED } from "@/lib/swr-keys";
import { useSWRConfig } from "swr";
import { Trash2 } from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";

export type FeedPostRow = {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string | null;
  authorName: string | null;
  authorImage: string | null;
};

function initials(name: string | null) {
  const t = (name || "익명").trim();
  if (!t) return "익";
  const p = t.split(/\s+/);
  if (p.length >= 2) return (p[0]![0]! + p[1]![0]!).toUpperCase();
  return t.slice(0, 2);
}

type FeedPostCardProps = {
  post: FeedPostRow;
};

export function FeedPostCard({ post }: FeedPostCardProps) {
  const { session } = useRequireAuth();
  const { mutate } = useSWRConfig();
  const isMine = session?.user?.id === post.userId;
  const time = post.createdAt ? dayjs(post.createdAt).format("YYYY.MM.DD HH:mm") : "";

  return (
    <Card className="border-border/80 bg-card text-card-foreground shadow-sm">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-start gap-3">
          <Avatar className="size-9 shrink-0">
            {post.authorImage ? <AvatarImage src={post.authorImage} alt="" /> : null}
            <AvatarFallback className="text-xs">{initials(post.authorName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{post.authorName || "익명"}</p>
            {time ? (
              <time className="text-xs text-foreground/65" dateTime={post.createdAt ?? undefined}>
                {time}
              </time>
            ) : null}
          </div>
          {isMine ? (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              aria-label="삭제"
              onClick={async () => {
                if (!confirm("이 글을 삭제할까요?")) return;
                const res = await fetch(`/api/feed/${post.id}`, { method: "DELETE" });
                const json = (await res.json().catch(() => ({}))) as { status?: number; message?: string };
                if (res.ok && json?.status === 200) {
                  toast.success("삭제되었습니다.");
                  void mutate(SWR_FEED);
                } else {
                  toast.error(json?.message ?? "삭제에 실패했습니다.");
                }
              }}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          ) : null}
        </div>
        <h2 className="text-base font-semibold leading-snug text-foreground text-balance">{post.title}</h2>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
          {post.body}
        </p>
      </CardContent>
    </Card>
  );
}
