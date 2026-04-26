"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { useSingleCourse } from "@/lib/fetcher/useSingleCourse";
import { useRequireAuth } from "@/components/auth/use-require-auth";
import { cn } from "@/lib/utils";

export default function ReviewInput(props: {
  courseId: string;
  getSingleCourse?: (id: string, preview?: { name?: string }) => void;
  onReviewAdded?: () => void;
}) {
  const [reviewVal, setReviewVal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate } = useSingleCourse(props.courseId);
  const { session, isPending, requireAuth } = useRequireAuth();

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewVal.trim()) {
      toast.error("리뷰 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews/" + props.courseId, {
        method: "POST",
        body: JSON.stringify({
          value: reviewVal,
        }),
      });

      const json = await response.json();

      if (json && json.status === 200) {
        toast.success("댓글이 등록되었습니다.");
        setReviewVal("");

        if (mutate) {
          await mutate();
        }

        if (props.onReviewAdded) {
          props.onReviewAdded();
        }
      } else {
        toast.error("댓글 등록 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("리뷰 등록 오류:", err);
      toast.error("댓글 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isPending && !session) {
    return (
      <div className="pb-0.5">
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto w-full justify-start px-0 py-1.5 text-muted-foreground"
          onClick={() => {
            requireAuth({ type: "review", courseId: props.courseId });
          }}
        >
          <LogIn className="size-4 shrink-0" data-icon="inline-start" />
          리뷰를 남기려면 로그인
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmitHandler} className="w-full min-w-0">
      <FieldGroup className="w-full min-w-0 gap-0 space-y-2.5">
        <Field className="min-w-0 space-y-0">
          <FieldLabel
            htmlFor={`review-${props.courseId}`}
            className="text-xs text-muted-foreground"
          >
            댓글
          </FieldLabel>
          <Textarea
            id={`review-${props.courseId}`}
            placeholder="이 코스에 대한 의견을 남겨주세요"
            value={reviewVal}
            onChange={(e) => setReviewVal(e.target.value)}
            required
            disabled={isSubmitting}
            rows={3}
            className={cn(
              "min-h-[4.5rem] w-full resize-y bg-background/50 text-sm",
              "placeholder:text-muted-foreground/80"
            )}
          />
        </Field>
        <div className="flex justify-end">
          <Button
            type="submit"
            size="default"
            disabled={isSubmitting}
            className="min-w-[5.5rem]"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="size-4" data-icon="inline-start" />
                등록 중…
              </span>
            ) : (
              "등록"
            )}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
