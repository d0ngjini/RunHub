"use client"

import { signIn } from "next-auth/react"
import {Button} from "@nextui-org/react";

export function SignInButton() {
    return <button color={'success'} onClick={() => signIn()}>로그인</button>
}