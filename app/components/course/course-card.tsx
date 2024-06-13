import {Card, CardBody, CardHeader} from "@nextui-org/card";
import ReviewList from "@/app/components/reviews/review-list";
import ReviewInput from "@/app/components/reviews/review-input";
import {Button, Divider} from "@nextui-org/react";
import Image from 'next/image';
import {RiCheckLine, RiCloseFill, RiCloseLine, RiHeart3Line, RiThumbUpLine} from "react-icons/ri";
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";

export default function CourseCard(props: any) {
    const {isCardHidden, cardData, setCardData, getSingleCourse, setCardHidden} = props;
    const [isCourseLiked, setIsCourseLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    const getCourseLikes = async () => {
        return await fetch(`/api/courses/${cardData.id}/like`, {
            method: 'GET',
        })
    }

    useEffect(() => {
        getCourseLikes()
        .then(res => res.json())
        .then(res => {
            console.log('res', res);
            setLikeCount(res.data.count._count.isLike)
        })
    }, [cardData, getCourseLikes])

    let session: any = useSession();

    const addCourseLike = async () => {
        await fetch(`/api/courses/${cardData.id}/like`, {
            method: 'POST',
            body: JSON.stringify({
                courseId: cardData.id,
                userId: session.data.userId,
                isLiked: !isCourseLiked,
            })
        }).then(res => {
            return res.json()
        }).then(data => {
            if (data.status !== 200) {
                alert('로그인이 필요합니다.');
            } else {
                setIsCourseLiked(!isCourseLiked);
                setCardData({
                    ...cardData,
                    isLiked: !cardData.isLiked
                })
            }
        });
    }
    
    return (
        <>
            {
                isCardHidden &&
                <Card className="absolute z-40 w-96 py-1 bottom-0 mb-4 right-1/2 translate-x-1/2">
                    <Button size="sm" className="absolute z-20 right-1 top-1 rounded-2xl bg-gray-50" onClick={() => {
                        setCardHidden(!isCardHidden)
                    }} isIconOnly>
                        <RiCloseLine className="text-lg" />
                    </Button>
                    <CardHeader className="flex-col items-start">
                        <small className="text-default-500">{cardData.createdAt}</small>
                        <div className="flex w-full justify-between items-center">
                            <div className="flex-col">
                                <h4 className="font-bold text-large">{cardData.name}</h4>
                                <p className="text-tiny uppercase font-bold">{cardData.description}</p>
                            </div>
                            {
                                isCourseLiked
                                    ?
                                    <Button size="sm" variant="bordered" color="success" className="small" title="좋아요" onClick={() => {
                                        addCourseLike()
                                    }}>
                                        <RiCheckLine />추천 {likeCount}
                                    </Button>
                                    :
                                    <Button size="sm" variant="bordered" color="primary" className="small" title="좋아요" onClick={ () => {
                                        addCourseLike()
                                    }}>
                                        <RiThumbUpLine />추천 {likeCount}
                                    </Button>
                            }
                        </div>
                    </CardHeader>
                    <Divider/>
                    <div className="px-3 pt-3 text-sm font-semibold">리뷰 <span className="text-xs text-gray-500">({cardData.courseComments.length})</span></div>
                    <CardBody className="items-center flex-col gap-3">
                        <ReviewList data={cardData.courseComments}/>
                        <ReviewInput courseId={cardData.id} getSingleCourse={getSingleCourse}/>
                    </CardBody>
                </Card> 
            }
        </>
    )
}