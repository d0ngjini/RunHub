"use client"

import {signIn, signOut, useSession} from "next-auth/react"
import {Button, DropdownItem, DropdownMenu, Image} from "@nextui-org/react";
import Avatar from 'boring-avatars';
import {Dropdown, DropdownTrigger} from "@nextui-org/dropdown";
import {RiArrowDropDownFill, RiLogoutBoxLine, RiMarkPenLine} from "react-icons/ri";
import {useCallback, useEffect, useState} from "react";
import dayjs from "dayjs";

export function SignInButton(props: any) {
    const { data: session } = useSession();
    const { setDrawState, isDrawState } = props;
    const [timeLeft, setTimeLeft] = useState<number>();

    // 세션 만료 시간을 계산하여 남은 시간을 업데이트하는 함수
    const calculateTimeLeft = useCallback(() => {
        if (session?.expires) {
            const expirationTime = dayjs(session.expires);
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
    const formatTime = (timeInMilliseconds: number) => {
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
            icon: <RiMarkPenLine/>,
            onClick: () => {
                setDrawState(!isDrawState)
            },
        },
        {
            key: "delete",
            label: "로그아웃",
            icon: <RiLogoutBoxLine/>,
            onClick: () => {
                signOut();
            },
        }
    ];

    if (session) {
        return (
            <>
                <div className="absolute top-2 right-2">
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                variant="solid"
                                color="default"
                                className="bg-white bg-opacity-90 gap-1"
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
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Dynamic Actions" items={ items } disabledKeys={ ["time"] }>
                            {(item) => (
                                <DropdownItem
                                    key={item.key}
                                    color={item.key === "delete" ? "danger" : "default"}
                                    className={item.key === "delete" ? "text-danger" : "" + " flex flex-row select-none"}
                                    onPress={item.onClick}
                                >
                                    <div className="flex gap-2 items-center">
                                        {item.icon}
                                        {item.label}
                                    </div>
                                </DropdownItem>
                            )}
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </>
        );
    }

    return (
        <>
            <Button className={"absolute z-20 top-2 right-2 flex justify-between items-center gap-2 bg-white p-2 rounded shadow"}
                    onClick={(e: any) => {
                        signIn()
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