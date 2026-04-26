"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, Bookmark, MessagesSquare, PencilLine, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useExplorePanels } from "@/components/app/explore-panels-context";
import { authClient } from "@/lib/auth-client";
import { useAuthUi } from "@/components/auth/auth-store";

type MapFloatingDockProps = {
  isDrawActive: boolean;
  onCourseCreate: () => void;
};

/** 지도 위 플로팅 UI — Dialog / Card 와 동일한 시맨틱 토큰 */
const iconClass =
  "size-5 text-muted-foreground transition-[color,transform] duration-200 ease-out sm:size-[22px]";

const dockButtonClass = cn(
  "size-10 shrink-0 rounded-xl border border-transparent p-0 text-muted-foreground",
  "hover:bg-muted/60 hover:text-foreground",
  "active:scale-[0.97]",
  "data-[active=true]:border-primary/40 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground",
  "data-[active=true]:[&_svg]:text-primary-foreground",
  "data-[active=true]:shadow-md data-[active=true]:shadow-primary/30",
  "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-0 focus-visible:ring-offset-background"
);

type DockItemProps = {
  active: boolean;
  "aria-pressed"?: boolean;
  label: string;
  /** 툴팁에 보여 줄 기능 설명 */
  tooltip: string;
  onClick: () => void;
  children: ReactNode;
};

function DockItem({
  active,
  "aria-pressed": ariaPressed,
  label,
  tooltip,
  onClick,
  children,
}: DockItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={dockButtonClass}
          data-active={active}
          onClick={onClick}
          aria-pressed={ariaPressed ?? active}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={10} className="z-[200]">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

/** 맥OS 독 느낌 — 가로 pill, 아이콘만, blur 글라스 */
export function MapFloatingDock({ isDrawActive, onCourseCreate }: MapFloatingDockProps) {
  const { active, openPanel } = useExplorePanels();
  const { data: session } = authClient.useSession();
  const { openAuth } = useAuthUi();

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-2 pt-2"
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <TooltipProvider delayDuration={250}>
        <nav
          className={cn(
            "pointer-events-auto flex w-fit max-w-full items-center gap-1 rounded-[1.25rem]",
            "border border-border/80 bg-popover/95 px-1.5 py-1.5 text-popover-foreground shadow-lg ring-1 ring-foreground/10",
            "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl backdrop-saturate-150",
            "supports-[backdrop-filter]:bg-popover/88"
          )}
          aria-label="지도 도구"
        >
          <DockItem
            active={isDrawActive}
            label={isDrawActive ? "그리기 종료" : "코스 그리기"}
            tooltip={isDrawActive ? "그리기 종료" : "지도에 코스 그리기·등록"}
            onClick={onCourseCreate}
          >
            <PencilLine className={iconClass} aria-hidden />
          </DockItem>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/feed"
                className={cn(
                  dockButtonClass,
                  "inline-flex items-center justify-center no-underline",
                  "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-0 focus-visible:ring-offset-background",
                  "outline-none"
                )}
                aria-label="러닝 피드"
              >
                <MessagesSquare className={iconClass} aria-hidden />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={10} className="z-[200]">
              러닝 피드 — 글 보기·작성
            </TooltipContent>
          </Tooltip>
          <DockItem
            active={active === "saved"}
            label="저장된 코스"
            tooltip="저장한 코스"
            onClick={() => openPanel("saved")}
          >
            <Bookmark className={iconClass} aria-hidden />
          </DockItem>
          <DockItem
            active={active === "me"}
            label="내 정보"
            tooltip="프로필·내 정보·설정"
            onClick={() => {
              if (session?.user) {
                openPanel("me");
              } else {
                openAuth({ type: "generic" });
              }
            }}
          >
            <UserRound className={iconClass} aria-hidden />
          </DockItem>
          <DockItem
            active={active === "notifications"}
            label="알림"
            tooltip="알림"
            onClick={() => openPanel("notifications")}
          >
            <Bell className={iconClass} aria-hidden />
          </DockItem>
        </nav>
      </TooltipProvider>
    </div>
  );
}
