"use client"

import {signIn, signOut, useSession} from "next-auth/react"
import {Button, DropdownItem, DropdownMenu, Image} from "@nextui-org/react";
import Avatar from 'boring-avatars';
import {Dropdown, DropdownTrigger} from "@nextui-org/dropdown";
import {RiArrowDropDownFill, RiLogoutBoxLine, RiMarkPenLine} from "react-icons/ri";
import {useEffect, useState} from "react";
import dayjs from "dayjs";
import {cursor} from "sisteransi";
import left = cursor.left;

export function SignInButton(props: any) {
    const { data: session } = useSession();
    const { setDrawState, isDrawState } = props;
    const [ expire, setExpire ] = useState<number>(-1);

    useEffect(() => {
        if (!session) {
            return
        }

        const leftTime = dayjs(session.expires).unix() - dayjs().unix();
        setExpire(leftTime);

        setInterval(() => {
            setExpire((time) => {
                return time - 1
            });
        }, 1000)
    }, []);

    const items = [
        {
            key: 'time',
            label: `접속유지시간 : ${Math.floor(expire / 60)}분 ${expire % 60}초`,
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
                    로그인 정보가 없습니다.
                </span>
            </Button>
        </>
    );
}