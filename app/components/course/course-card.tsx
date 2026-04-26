import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldGroup, FieldTitle } from "@/components/ui/field";
import ReviewList, { ReviewListSkeleton } from "@/app/components/reviews/review-list";
import ReviewInput from "@/app/components/reviews/review-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Bookmark, Star, ThumbsUp, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useSingleCourse } from "@/lib/fetcher/useSingleCourse";
import React, { useState } from "react";
import { useRequireAuth } from "@/components/auth/use-require-auth";
import { useSWRConfig } from "swr";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

export default function CourseCard(props: {
  /** 코스 상세 Dialog 표시 — ExplorePanels의 `open`과 동일한 역할 */
  courseDialogOpen: boolean;
  cardData: any;
  setCardData: React.Dispatch<React.SetStateAction<any>>;
  setCourseDialogOpen: (v: boolean) => void;
  getSingleCourse: (id: string, preview?: { name?: string }) => void;
  /** 삭제·목록 갱신 등 지도 코스 SWR를 다시 불러올 때 */
  onCourseListChanged?: () => void;
}) {
  const { session, requireAuth } = useRequireAuth();
  const { courseDialogOpen, cardData, setCardData, setCourseDialogOpen, getSingleCourse, onCourseListChanged } =
    props;
  const { mutate: swrGlobalMutate } = useSWRConfig();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { course, mutate, isLoading: courseSwrLoading, isValidating: courseSwrValidating } =
    useSingleCourse(cardData?.id);
  const [likePending, setLikePending] = useState(false);
  const [bookmarkPending, setBookmarkPending] = useState(false);
  const [ratePending, setRatePending] = useState(false);
  /** 이 코스 패널에서 SWR 첫 페치가 끝난 뒤에는 백그라운드 revalidate 때 추천 UI를 숨기지 않음 */
  const likeUiSettledRef = React.useRef(false);
  const recommendLikePanelIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!course) return;

    setCardData((prev: { id?: string } & Record<string, unknown>) => {
      if (!prev || prev.id !== course.id) return prev;
      return {
        ...prev,
        ...course,
        courseComments: course.courseComments || [],
        isLiked: course.isLiked || false,
        likedCount: course.likedCount || 0,
        isBookmarked: Boolean(course.isBookmarked),
        avgRating: Number(course.avgRating ?? 0),
        ratingCount: Number(course.ratingCount ?? 0),
        userRating: Number(course.userRating ?? 0),
      };
    });
  }, [course, setCardData]);

  const addCourseLike = async () => {
    if (!requireAuth({ type: "likeCourse", courseId: cardData?.id })) return;
    if (!cardData?.id) return;

    const previous = { ...cardData };
    const wasLiked = Boolean(cardData.isLiked);
    const nextLiked = !wasLiked;
    const baseCount = Number(cardData.likedCount) || 0;
    const optimisticCount = Math.max(0, baseCount + (nextLiked ? 1 : -1));

    setCardData((d: any) => ({
      ...d,
      isLiked: nextLiked,
      likedCount: optimisticCount,
    }));

    setLikePending(true);
    try {
      const res = await fetch(`/api/courses/${cardData.id}/like`, {
        method: "POST",
        body: JSON.stringify({
          courseId: cardData.id,
          isLiked: nextLiked,
        }),
      });
      const json = (await res.json()) as {
        status?: number;
        isLiked?: boolean;
        likedCount?: number;
      };

      if (res.status === 401 || json?.status === 401) {
        setCardData(previous);
        toast.error("로그인이 필요합니다.");
        return;
      }
      if (json?.status !== 200) {
        setCardData(previous);
        toast.error("처리에 실패했습니다.");
        return;
      }

      const next = {
        isLiked: Boolean(json.isLiked),
        likedCount: Math.max(0, Number(json.likedCount ?? optimisticCount)),
      };
      setCardData((d: any) => ({ ...d, ...next }));

      await mutate(
        (cur) => {
          if (!cur?.content) return cur;
          return {
            ...cur,
            content: { ...cur.content, ...next },
          };
        },
        { revalidate: false }
      );
    } catch {
      setCardData(previous);
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setLikePending(false);
    }
  };

  const toggleBookmark = async () => {
    if (!requireAuth({ type: "generic" })) return;
    if (!cardData?.id) return;

    const previous = { ...cardData };
    const next = !Boolean(cardData.isBookmarked);
    setCardData((d: any) => ({ ...d, isBookmarked: next }));

    setBookmarkPending(true);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: cardData.id }),
      });
      const json = (await res.json()) as { status?: number; message?: string };

      if (res.status === 401 || json?.status === 401) {
        setCardData(previous);
        toast.error("로그인이 필요합니다.");
        return;
      }
      if (json?.status !== 200) {
        setCardData(previous);
        toast.error("북마크 처리에 실패했습니다.");
        return;
      }

      const saved = json.message === "saved";
      setCardData((d: any) => ({ ...d, isBookmarked: saved }));
      await mutate(
        (cur) => {
          if (!cur?.content) return cur;
          return {
            ...cur,
            content: { ...cur.content, isBookmarked: saved },
          };
        },
        { revalidate: false }
      );
    } catch {
      setCardData(previous);
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setBookmarkPending(false);
    }
  };

  const submitRating = async (stars: number) => {
    if (!requireAuth({ type: "generic" })) return;
    if (!cardData?.id) return;

    setRatePending(true);
    try {
      const res = await fetch(`/api/courses/${cardData.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars }),
      });
      const json = (await res.json()) as {
        status?: number;
        userRating?: number;
        avgRating?: number;
        ratingCount?: number;
      };

      if (res.status === 401 || json?.status === 401) {
        toast.error("로그인이 필요합니다.");
        return;
      }
      if (json?.status !== 200) {
        toast.error("별점을 저장하지 못했습니다.");
        return;
      }

      const patch = {
        userRating: Number(json.userRating ?? 0),
        avgRating: Number(json.avgRating ?? 0),
        ratingCount: Number(json.ratingCount ?? 0),
      };
      setCardData((d: any) => ({ ...d, ...patch }));
      await mutate(
        (cur) => {
          if (!cur?.content) return cur;
          return { ...cur, content: { ...cur.content, ...patch } };
        },
        { revalidate: false }
      );
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setRatePending(false);
    }
  };

  const deleteCourse = async () => {
    if (!requireAuth({ type: "generic" })) return;
    if (!cardData?.id) return;

    const deletedId = String(cardData.id);
    const res = await fetch(`/api/courses/${deletedId}`, {
      method: "DELETE",
      body: JSON.stringify({ courseId: deletedId }),
    });
    const data = await res.json();
    if (data && data.status === 200) {
      toast.success("코스가 정상적으로 삭제되었습니다.");
      setDeleteOpen(false);
      setCourseDialogOpen(false);
      setCardData({
        name: "",
        createdAt: "",
        description: "",
        reviews: [],
        courseComments: [],
        id: "",
      });
      void swrGlobalMutate(`/api/courses/${deletedId}`, undefined, { revalidate: false });
      onCourseListChanged?.();
    } else {
      toast.error("데이터 처리 중 오류가 발생했습니다.");
    }
  };

  const handleReviewAdded = () => {
    if (mutate) {
      void mutate();
    }
  };

  const safeCardData = {
    id: cardData?.id || "",
    name: cardData?.name || "",
    createdAt: cardData?.createdAt || "",
    description: cardData?.description || "",
    userId: cardData?.userId || "",
    isLiked: cardData?.isLiked || false,
    likedCount: cardData?.likedCount || 0,
    isBookmarked: Boolean(cardData?.isBookmarked),
    avgRating: Number(cardData?.avgRating ?? 0),
    ratingCount: Number(cardData?.ratingCount ?? 0),
    userRating: Number(cardData?.userRating ?? 0),
    courseComments: Array.isArray(cardData?.courseComments) ? cardData.courseComments : [],
  };

  const open = courseDialogOpen && Boolean(safeCardData.id);

  if (!open) {
    recommendLikePanelIdRef.current = null;
    likeUiSettledRef.current = false;
  } else if (safeCardData.id && safeCardData.id !== recommendLikePanelIdRef.current) {
    recommendLikePanelIdRef.current = safeCardData.id;
    likeUiSettledRef.current = false;
  }

  React.useEffect(() => {
    if (!open || !safeCardData.id) return;
    if (!courseSwrLoading && !courseSwrValidating) {
      likeUiSettledRef.current = true;
    }
  }, [open, safeCardData.id, courseSwrLoading, courseSwrValidating]);

  /** 목록/낙관적 캐시에 댓글이 비어 있을 때 검증 전 빈 화면이 깜빡이지 않도록 */
  const courseDetailPending =
    Boolean(safeCardData.id) &&
    (courseSwrLoading || courseSwrValidating) &&
    safeCardData.courseComments.length === 0;
  /** 별점 요약도 동일하게 0으로 두었다가 갱신되는 경우가 많아 같은 조건으로 스켈레톤 처리 */
  const ratingSummaryPending =
    courseDetailPending && safeCardData.ratingCount === 0 && safeCardData.avgRating === 0;
  /** 첫 상세 페치가 끝나기 전까지만 스켈레톤 (백그라운드 revalidate 제외) */
  const recommendPending =
    Boolean(safeCardData.id) &&
    !likePending &&
    open &&
    (courseSwrLoading || courseSwrValidating) &&
    !likeUiSettledRef.current;
  const createdLabel = safeCardData.createdAt
    ? dayjs(safeCardData.createdAt).format("YYYY.MM.DD HH:mm")
    : null;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setCourseDialogOpen(false);
          }
        }}
      >
        {/*
         * `DialogContent` 기본에 `fixed`가 있음. `relative`를 넣으면 tailwind-merge가 `fixed`를 덮어써
         * 본문이 뷰포트에 붙지 않고 오버레이만 보이는 현상이 난다. (ExplorePanels / LoginDialog는 `relative` 미사용)
         */}
        <DialogContent
          showCloseButton={false}
          className={cn(
            "flex max-h-[min(88dvh,640px)] w-full max-w-md flex-col gap-0 overflow-hidden p-0 shadow-2xl ring-0 sm:max-w-md"
          )}
        >
          <DialogHeader className="shrink-0 gap-0 px-5 pt-6 pb-5 sm:px-6 sm:pt-7">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0 flex-1 text-left">
                <DialogTitle className="text-balance pr-1 text-lg font-semibold leading-snug sm:text-xl">
                  {safeCardData.name}
                </DialogTitle>
              </div>
              <div
                className="flex shrink-0 flex-nowrap items-center gap-0.5 sm:flex-wrap sm:justify-end"
                data-disabled={ratePending}
              >
                <div
                  className="flex flex-nowrap items-center gap-0.5"
                  role="group"
                  aria-label="이 코스 별점"
                  aria-busy={ratePending}
                >
                  {([1, 2, 3, 4, 5] as const).map((k) => {
                    const on = k <= (safeCardData.userRating || 0);
                    return (
                      <Button
                        key={k}
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={ratePending}
                        className="h-7 w-7 shrink-0 active:scale-95 sm:h-8 sm:w-8"
                        aria-label={`${k}점`}
                        aria-pressed={on}
                        onClick={() => void submitRating(k)}
                      >
                        <Star
                          className={cn(
                            on
                              ? "size-3.5 fill-amber-400 text-amber-500 sm:size-4"
                              : "size-3.5 text-foreground/45 sm:size-4"
                          )}
                          aria-hidden
                        />
                      </Button>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="shrink-0"
                  disabled={bookmarkPending}
                  aria-pressed={safeCardData.isBookmarked}
                  aria-label={safeCardData.isBookmarked ? "북마크 해제" : "북마크"}
                  aria-busy={bookmarkPending}
                  onClick={() => {
                    void toggleBookmark();
                  }}
                >
                  {bookmarkPending ? (
                    <Spinner className="size-4" data-icon="inline-start" />
                  ) : (
                    <Bookmark
                      className={cn("size-4", safeCardData.isBookmarked && "fill-primary text-primary")}
                      fill={safeCardData.isBookmarked ? "currentColor" : "none"}
                      aria-hidden
                    />
                  )}
                </Button>
                {session?.user?.id === safeCardData.userId ? (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label="코스 삭제"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                ) : null}
                <DialogClose asChild>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="닫기">
                    <X aria-hidden />
                    <span className="sr-only">닫기</span>
                  </Button>
                </DialogClose>
              </div>
            </div>
            <div className="mt-2.5 flex flex-col gap-2.5 text-left">
              {safeCardData.description ? (
                <DialogDescription className="text-balance text-sm">
                  {safeCardData.description}
                </DialogDescription>
              ) : null}
              {createdLabel ? (
                <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                  {createdLabel}
                </p>
              ) : null}
            </div>

            {ratingSummaryPending ? (
              <Skeleton className="mt-3 h-4 w-44 max-w-full rounded-md" aria-hidden />
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                {safeCardData.ratingCount > 0
                  ? `평균 ${safeCardData.avgRating.toFixed(1)} · ${safeCardData.ratingCount}명`
                  : "별점이 없어요"}
              </p>
            )}

            <div className="mt-4">
              {recommendPending ? (
                <div
                  className="flex min-h-10 items-center"
                  aria-busy="true"
                  aria-live="polite"
                >
                  <span className="sr-only">추천 정보를 불러오는 중입니다</span>
                  <Skeleton className="h-10 w-44 max-w-full rounded-full" aria-hidden />
                </div>
              ) : (
                <Button
                  type="button"
                  variant={safeCardData.isLiked ? "default" : "secondary"}
                  disabled={likePending}
                  className="h-10 min-w-0 gap-2 rounded-full px-4"
                  aria-pressed={safeCardData.isLiked}
                  aria-busy={likePending}
                  onClick={() => {
                    void addCourseLike();
                  }}
                >
                  {likePending ? (
                    <Spinner className="size-4" data-icon="inline-start" />
                  ) : (
                    <ThumbsUp
                      className={cn("size-4", safeCardData.isLiked && "text-primary-foreground")}
                      fill={safeCardData.isLiked ? "currentColor" : "none"}
                      aria-hidden
                    />
                  )}
                  <span>추천</span>
                  <span className="min-w-6 text-end tabular-nums text-sm font-medium">
                    {safeCardData.likedCount}
                  </span>
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-border/45 px-3 pt-3 pb-5 sm:px-4 sm:pt-4 sm:pb-6">
            <FieldGroup className="min-h-0 flex-1 gap-0">
              <Field className="min-h-0 space-y-2 pb-1">
                <div className="flex shrink-0 items-center justify-between gap-2">
                  <FieldTitle className="text-sm">리뷰</FieldTitle>
                  {courseDetailPending ? (
                    <Skeleton className="h-4 w-9 rounded-md" aria-hidden />
                  ) : (
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {safeCardData.courseComments.length}개
                    </span>
                  )}
                </div>
                <FieldContent className="min-h-0 space-y-0 overflow-hidden">
                  <ScrollArea className="h-[min(200px,40vh)] w-full overscroll-contain sm:h-[min(220px,36vh)]">
                    <div className="pe-1 pb-1">
                      {courseDetailPending ? (
                        <ReviewListSkeleton rows={3} />
                      ) : (
                        <ReviewList data={safeCardData.courseComments} />
                      )}
                    </div>
                  </ScrollArea>
                </FieldContent>
              </Field>
              <div className="shrink-0 border-t border-border/35 pt-4">
                <ReviewInput
                  courseId={safeCardData.id}
                  getSingleCourse={getSingleCourse}
                  onReviewAdded={handleReviewAdded}
                />
              </div>
            </FieldGroup>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>내가 등록한 코스를 삭제할까요?</DialogTitle>
            <DialogDescription>이 작업은 되돌릴 수 없습니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              취소
            </Button>
            <Button type="button" variant="destructive" onClick={() => void deleteCourse()}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
