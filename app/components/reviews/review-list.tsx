import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";

type ReviewRow = {
  id?: string;
  comment?: string;
  createdAt?: string;
  User?: { name?: string };
};

/** 코스 상세 모달에서 SWR 검증 전·중 빈 리뷰 오인 방지용 */
export function ReviewListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul
      className="flex flex-col gap-4"
      aria-busy="true"
      aria-label="리뷰를 불러오는 중"
    >
      {Array.from({ length: rows }, (_, i) => (
        <li key={i}>
          <div className="flex gap-3">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </div>
              <Skeleton className="h-3.5 w-full max-w-[min(100%,280px)] rounded-md" />
              <Skeleton className="h-3.5 w-4/5 max-w-[min(100%,240px)] rounded-md" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function reviewerInitials(name: string) {
  const t = name.trim();
  if (!t) return "익";
  const parts = t.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return t.slice(0, 2);
}

export default function ReviewList(props: { data: ReviewRow[] | unknown[] }) {
  if (Array.isArray(props.data) && props.data.length) {
    return (
      <ul className="flex flex-col gap-4">
        {(props.data as ReviewRow[]).map((d, index) => (
          <li key={d.id || String(index)}>
            <div className="flex gap-3">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="text-xs">
                  {reviewerInitials(d.User?.name || "익명")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {d.User?.name || "익명"}
                  </span>
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={d.createdAt}
                  >
                    {d.createdAt
                      ? dayjs(d.createdAt).format("YYYY.MM.DD HH:mm")
                      : ""}
                  </time>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm text-foreground/90">
                  {d.comment}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Empty className="border-none bg-transparent py-6">
      <EmptyHeader>
        <EmptyTitle>첫 리뷰를 남겨 주세요</EmptyTitle>
        <EmptyDescription>
          코스에 대한 짧은 소감을 남기면 다른 러너에게 도움이 됩니다.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
