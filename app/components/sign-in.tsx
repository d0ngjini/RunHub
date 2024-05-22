"use client"

import {signIn, useSession} from "next-auth/react"
import {Button} from "@nextui-org/react";
import Avatar from 'boring-avatars';

export function SignInButton() {
    const { data: session } = useSession();

    if (session) {
        return (
            <>
                <div className={"flex justify-between items-center gap-2 bg-white p-2 rounded shadow"}>
                    <Avatar
                        size={24}
                        name={session.user?.name || '값없음'}
                        variant="beam"
                        colors={['#fcfcfc', '#ff5400', '#6c6c6c', '#7cff00', '#DF8615']}
                    />
                    <span className={"font-semibold"}>
                        {session.user?.name}님 환영합니다.
                    </span>
                </div>
            </>
        );
    }
    
    return (
        <>
            <Button className={"flex justify-between items-center gap-2 bg-white p-2 rounded shadow"} onClick={(e: any) => { signIn() }}>
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