"use client"

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Avatar from 'boring-avatars';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiArrowDropDownFill, RiLogoutBoxLine, RiMarkPenLine } from "react-icons/ri";
import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export function SignInButton(props: any) {
    const { data: session } = authClient.useSession();
    const { setDrawState, isDrawState } = props;
    const [timeLeft, setTimeLeft] = useState<number>();

    // 세션 만료 시간을 계산하여 남은 시간을 업데이트하는 함수
    const calculateTimeLeft = useCallback(() => {
        const expiresAt = session?.session?.expiresAt;
        if (expiresAt) {
            const expirationTime = dayjs(expiresAt);
            const currentTime = dayjs();
            const tl = expirationTime.diff(currentTime); // 밀리초로 남은 시간 계산
            setTimeLeft(tl);
        }
    }, [session]);

    useEffect(() => {
        calculateTimeLeft(); // 초기 계산

        // 1초마다 남은 시간을 업데이트
        const intervalId = setInterval(() => {
            calculateTimeLeft();
        }, 1000);

        // 컴포넌트가 언마운트될 때 setInterval 정리
        return () => clearInterval(intervalId);
    }, [session, calculateTimeLeft]);

    // 남은 시간을 'mm:ss' 형식으로 변환하는 함수
    const formatTime = (timeInMilliseconds: number | undefined) => {
        if (!timeInMilliseconds) return "00분 00초";
        const duration = dayjs.duration(timeInMilliseconds);
        const minutes = duration.minutes();
        const seconds = duration.seconds();
        return `${minutes.toString().padStart(2, '0')}분 ${seconds.toString().padStart(2, '0')}초`;
    };

    const items = [
        {
            key: 'time',
            label: `접속유지시간 : ${formatTime(timeLeft)}`,

        },
        {
            key: "new",
            label: "러닝코스 추가",
            icon: <RiMarkPenLine />,
            onClick: () => {
                setDrawState(!isDrawState)
            },
        },
        {
            key: "delete",
            label: "로그아웃",
            icon: <RiLogoutBoxLine />,
            onClick: () => {
                authClient.signOut();
            },
        }
    ];

    if (session) {
        return (
            <>
                <div className="absolute top-2 right-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="bg-background/90 gap-1"
                            >
                                <Avatar
                                    size={16}
                                    name={session.user?.name || '값없음'}
                                    variant="beam"
                                    colors={['#fcfcfc', '#ff5400', '#6c6c6c', '#7cff00', '#DF8615']}
                                />
                                <span className={"font-semibold"}>
                                    {session.user?.name}
                                </span>
                                <RiArrowDropDownFill />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="text-xs text-default-500">
                                {items[0]?.label}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => items[1]?.onClick?.()} className="gap-2">
                                {items[1]?.icon}
                                <span>{items[1]?.label}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => items[2]?.onClick?.()} className="gap-2">
                                {items[2]?.icon}
                                <span>{items[2]?.label}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </>
        );
    }

    return (
        <>
            <Button className={"absolute z-20 top-2 right-2 flex justify-between items-center gap-2 bg-background p-2 rounded-lg shadow"}
                onClick={(e: any) => {
                    authClient.signIn.social({ provider: "kakao" })
                }}>
                <Avatar
                    size={24}
                    name={"noname"}
                    variant="beam"
                    colors={['#fcfcfc', '#ff5400', '#6c6c6c', '#7cff00', '#DF8615']}
                />
                <span className={"font-semibold"}>
                    로그인
                </span>
            </Button>
        </>
    );
}