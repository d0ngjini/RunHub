import React, { useState } from "react";
import { Button, Image, Textarea } from "@nextui-org/react";
import { signIn, useSession } from "next-auth/react";
import { RiLoginBoxLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { useSingleCourse } from "@/lib/fetcher/useSingleCourse";

export default function ReviewInput(props: any) {
    const [reviewVal, setReviewVal] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { course, mutate, isLoading, error } = useSingleCourse(props.courseId);

    console.log('course', course);

    const onSubmitHandler = async (e: any) => {
        e.preventDefault();

        if (!reviewVal.trim()) {
            toast.error('리뷰 내용을 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/reviews/' + props.courseId, {
                method: 'POST',
                body: JSON.stringify({
                    value: reviewVal,
                }),
            });

            const json = await response.json();

            if (json && json.status === 200) {
                toast.success('댓글이 등록되었습니다.');
                setReviewVal(""); // 입력 필드 초기화

                // SWR 데이터 갱신
                if (mutate) {
                    await mutate();
                }

                // 부모 컴포넌트에 리뷰 갱신 알림
                if (props.onReviewAdded) {
                    props.onReviewAdded();
                }
            } else {
                toast.error('댓글 등록 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('리뷰 등록 오류:', error);
            toast.error('댓글 등록 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const onSignHandler = (e: any) => {
        e.preventDefault();
        signIn();
    }

    let session = useSession();

    if (session.status === 'unauthenticated') {
        return <>
            <div className="w-full flex gap-2 items-center" onSubmit={onSignHandler}>
                <a href="#" className="flex gap-2 items-center text-sm font-bold underline underline-offset-4" onClick={() => {
                    signIn()
                }}><RiLoginBoxLine />리뷰를 남기려면 로그인이 필요합니다.</a>
            </div>
        </>
    }

    return (
        <form className="w-full flex gap-2 items-center" onSubmit={onSubmitHandler}>
            <Textarea
                variant="bordered"
                maxRows={2}
                placeholder="매너 리뷰 부탁드려요. 😉"
                value={reviewVal}
                onValueChange={setReviewVal}
                isRequired={true}
                isDisabled={isSubmitting}
            />
            <Button
                className="absolute right-6"
                color="primary"
                type={"submit"}
                variant={"faded"}
                isIconOnly
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
            >
                {!isSubmitting && <Image width={"24"} src="https://www.svgrepo.com/show/532154/check.svg" />}
            </Button>
        </form>
    );
};