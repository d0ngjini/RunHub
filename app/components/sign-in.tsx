"use client";

import { authClient } from "@/lib/auth-client";
import { signOutWithFeedback } from "@/components/auth/sign-out-feedback";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Avatar from "boring-avatars";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiArrowDropDownFill, RiLogoutBoxLine, RiMarkPenLine } from "react-icons/ri";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export function SignInButton(props: { setDrawState: (v: boolean) => void; isDrawState: boolean }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { setDrawState, isDrawState } = props;
  const [timeLeft, setTimeLeft] = useState<number>();

  const calculateTimeLeft = useCallback(() => {
    const expiresAt = session?.session?.expiresAt;
    if (expiresAt) {
      const expirationTime = dayjs(expiresAt);
      const currentTime = dayjs();
      const tl = expirationTime.diff(currentTime);
      setTimeLeft(tl);
    }
  }, [session]);

  useEffect(() => {
    calculateTimeLeft();
    const intervalId = setInterval(() => {
      calculateTimeLeft();
    }, 1000);
    return () => clearInterval(intervalId);
  }, [session, calculateTimeLeft]);

  const formatTime = (timeInMilliseconds: number | undefined) => {
    if (!timeInMilliseconds) return "00분 00초";
    const dur = dayjs.duration(timeInMilliseconds);
    const minutes = dur.minutes();
    const seconds = dur.seconds();
    return `${minutes.toString().padStart(2, "0")}분 ${seconds.toString().padStart(2, "0")}초`;
  };

  const items = [
    {
      key: "time",
      label: `접속유지시간 : ${formatTime(timeLeft)}`,
    },
    {
      key: "new",
      label: "러닝코스 추가",
      icon: <RiMarkPenLine />,
      onClick: () => {
        setDrawState(!isDrawState);
      },
    },
    {
      key: "delete",
      label: "로그아웃",
      icon: <RiLogoutBoxLine />,
      onClick: () => {
        void signOutWithFeedback({
          onAfterSignOut: () => {
            router.refresh();
          },
        });
      },
    },
  ];

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Avatar size={16} name={session.user?.name || "값없음"} variant="beam" />
            {session.user?.name}
            <RiArrowDropDownFill />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{items[0]?.label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => items[1]?.onClick?.()}>
            {items[1]?.icon}
            {items[1]?.label}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => items[2]?.onClick?.()}>
            {items[2]?.icon}
            {items[2]?.label}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={() => {
        authClient.signIn.social({ provider: "kakao" });
      }}
    >
      <Avatar size={24} name="noname" variant="beam" />
      로그인
    </Button>
  );
}
