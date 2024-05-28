import {Button, Image, Textarea} from "@nextui-org/react";
import {useEffect, useState} from "react";
import {signIn, useSession} from "next-auth/react";

export default function ReviewInput(props: any) {
    const { getSingleCourse } = props;
    const [reviewVal, setReviewVal] = useState("");
    const onSubmitHandler = async (e: any) => {
        e.preventDefault();

        await fetch('/api/reviews/' + props.courseId, {
            method: 'POST',
            body: JSON.stringify({
                value: reviewVal,
            }),
        }).then(res => {
            res.json().then(data => {
                if (data && data.status === 200) {
                    alert('댓글이 등록되었습니다.')
                    getSingleCourse(props.courseId);
                } else {
                    alert('댓글 등록 중 오류가 발생했습니다.');
                }
            });
        })
    }

    const onSignHandler = (e: any) => {
        e.preventDefault();
        signIn();
    }

    let session = useSession();
    console.log('client session', session);

    if (session.status === 'unauthenticated') {
        return <>
            <div className="w-full flex gap-2 items-center" onSubmit={onSignHandler}>
                <Textarea
                    variant="bordered"
                    maxRows={2}
                    label="1"
                    placeholder="리뷰를 남기기 위해 로그인이 필요합니다."
                    value={reviewVal}
                    onValueChange={setReviewVal}
                    isRequired={true}
                />
                <Button color="primary" type={"button"} variant={"faded"} isIconOnly  onClick={(e: any) => {
                    signIn();
                }} >
                    <Image width={"14"} src="https://www.svgrepo.com/show/509153/login.svg"/>
                </Button>
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
                // errorMessage="리뷰가 입력되지 않았어요!"
            />
            <Button color="primary" type={"submit"} variant={"faded"} isIconOnly>
                <Image width={"24"} src="https://www.svgrepo.com/show/532154/check.svg"/>
            </Button>
        </form>
    );
};