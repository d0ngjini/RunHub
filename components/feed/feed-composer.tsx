"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useRequireAuth } from "@/components/auth/use-require-auth";
import { SWR_FEED } from "@/lib/swr-keys";
import { useSWRConfig } from "swr";
import { toast } from "sonner";

type FeedComposerProps = {
  onPosted?: () => void;
};

export function FeedComposer({ onPosted }: FeedComposerProps) {
  const { session, isPending, requireAuth } = useRequireAuth();
  const { mutate } = useSWRConfig();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  if (isPending) {
    return null;
  }

  if (!session) {
    return (
      <div className="rounded-xl border border-border/80 bg-card/50 p-4 text-center text-sm text-foreground/80">
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-foreground"
          onClick={() => requireAuth({ type: "generic" })}
        >
          로그인하고 글을 올려 보세요
        </Button>
      </div>
    );
  }

  return (
    <form
      className="rounded-xl border border-border/80 bg-card p-4 shadow-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) {
          toast.error("제목과 본문을 입력해 주세요.");
          return;
        }
        setPending(true);
        try {
          const res = await fetch("/api/feed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: title.trim(), body: body.trim() }),
          });
          const json = (await res.json()) as { status?: number; message?: string };
          if (res.status === 401) {
            toast.error("로그인이 필요합니다.");
            requireAuth({ type: "generic" });
            return;
          }
          if (json?.status !== 200) {
            toast.error(json?.message ?? "게시에 실패했습니다.");
            return;
          }
          toast.success("게시되었습니다.");
          setTitle("");
          setBody("");
          await mutate(SWR_FEED);
          onPosted?.();
        } catch {
          toast.error("게시에 실패했습니다.");
        } finally {
          setPending(false);
        }
      }}
    >
      <FieldGroup className="gap-3">
        <Field>
          <FieldLabel htmlFor="feed-title" className="text-sm font-medium text-foreground/80">
            제목
          </FieldLabel>
          <Input
            id="feed-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            maxLength={200}
            autoComplete="off"
            disabled={pending}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="feed-body" className="text-sm font-medium text-foreground/80">
            본문
          </FieldLabel>
          <Textarea
            id="feed-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="런닝 이야기, 코스 질문, 응원 멘트 등을 자유롭게 올려 주세요."
            rows={4}
            maxLength={8000}
            className="min-h-24 resize-y"
            disabled={pending}
          />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" disabled={pending} className="min-w-24">
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="size-4" data-icon="inline-start" />
                올리는 중
              </span>
            ) : (
              "게시"
            )}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
