import { Card, CardBody, CardHeader } from "@nextui-org/card";
import ReviewList from "@/app/components/reviews/review-list";
import ReviewInput from "@/app/components/reviews/review-input";
import { Button, card, Divider, Spinner } from "@nextui-org/react";
import Image from 'next/image';
import { RiCheckLine, RiCloseFill, RiCloseLine, RiDeleteBin4Line, RiHeart3Line, RiThumbUpLine } from "react-icons/ri";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useSingleCourse } from "@/lib/fetcher/useSingleCourse";
import React from "react";

export default function CourseCard(props: any) {
    const { data: session } = useSession();
    const { isCardHidden, cardData, setCardData, setCardHidden, getSingleCourse } = props;

    // useSingleCourse 훅을 사용하여 데이터 동기화
    const { course, mutate, isLoading } = useSingleCourse(cardData?.id);

    console.log('cardData', cardData);
    console.log('course from SWR', course);

    // SWR에서 가져온 데이터가 있으면 cardData 업데이트
    React.useEffect(() => {
        if (course && cardData?.id === course.id) {
            setCardData({
                ...cardData,
                ...course,
                courseComments: course.courseComments || [],
                isLiked: course.isLiked || false,
                likedCount: course.likedCount || 0,
            });
        }
    }, [course, cardData?.id]);

    const addCourseLike = async () => {
        if (!session) {
            toast.error('리뷰를 추천하기 위해 로그인이 필요합니다.');
            return;
        }

        await fetch(`/api/courses/${cardData.id}/like`, {
            method: 'POST',
            body: JSON.stringify({
                courseId: cardData.id,
                userId: session.user?.id,
                isLiked: !cardData.isLiked,
            }),
        }).then(res => {
            return res.json()
        }).then(res => {
            if (res.status !== 200) {
                toast.error('데이터 처리 중 오류가 발생했습니다.');
            } else {
                setCardData({
                    ...cardData,
                    isLiked: !cardData.isLiked,
                });

                // SWR 데이터 갱신
                if (mutate) {
                    mutate();
                }
            }
        });
    }

    const deleteCourse = async () => {
        if (!confirm('내가 등록한 코스를 삭제하시겠습니까?')) {
            return;
        }

        if (!session) {
            toast.error('로그인 정보가 없습니다.');
            return;
        }

        await fetch(`/api/courses/${cardData.id}`, {
            method: 'DELETE',
            body: JSON.stringify({
                courseId: cardData.id,
            })
        })
            .then((res: any) => res.json())
            .then((data: any) => {
                if (data && data.status === 200) {
                    toast.success('코스가 정상적으로 삭제되었습니다.');
                    setCardHidden(false);
                } else {
                    toast.error('데이터 처리 중 오류가 발생했습니다.');
                }
            })

    }

    // 리뷰 추가 후 콜백 함수
    const handleReviewAdded = () => {
        // SWR 데이터 갱신
        if (mutate) {
            mutate();
        }
    };

    console.log('user session', session);

    // cardData가 유효한지 확인하는 안전한 체크 추가
    const safeCardData = {
        id: cardData?.id || '',
        name: cardData?.name || '',
        createdAt: cardData?.createdAt || '',
        description: cardData?.description || '',
        userId: cardData?.userId || '',
        isLiked: cardData?.isLiked || false,
        likedCount: cardData?.likedCount || 0,
        courseComments: Array.isArray(cardData?.courseComments) ? cardData.courseComments : [],
    };

    return (
        <>
            {
                (isCardHidden && safeCardData.id) &&
                <Card className="absolute z-40 w-full md:w-96 py-1 bottom-0 mb-0 md:mb-4 rounded-none md:rounded-xl right-1/2 translate-x-1/2">
                    {
                        session && session.user?.id === safeCardData.userId &&
                        <Button size="sm" color="danger" className="absolute z-20 right-10 top-1 rounded-2xl opacity-60" onClick={() => {
                            void deleteCourse();
                        }} isIconOnly>
                            <RiDeleteBin4Line size={16} />
                        </Button>
                    }

                    <Button size="sm" className="absolute z-20 right-1 top-1 rounded-2xl bg-gray-50" onClick={() => {
                        setCardHidden(!isCardHidden)
                    }} isIconOnly>
                        <RiCloseLine size={16} />
                    </Button>
                    <CardHeader className="flex-col items-start">
                        <small className="text-default-500">{safeCardData.createdAt}</small>
                        <div className="flex w-full justify-between items-center">
                            <div className="flex-col">
                                <h4 className="font-bold text-large">{safeCardData.name}</h4>
                                <p className="text-tiny uppercase font-bold">{safeCardData.description}</p>
                            </div>
                            {
                                isLoading
                                    ?
                                    <Button size="sm" variant="bordered" color="default" className="text-default">
                                        <Spinner size="sm" color="default" /> 로딩 중
                                    </Button>
                                    :
                                    <Button size="sm" variant="bordered" color={safeCardData.isLiked ? 'success' : 'primary'} className="small font-bold" title="좋아요" onClick={() => {
                                        void addCourseLike()
                                    }}>
                                        {
                                            safeCardData.isLiked ?
                                                <>
                                                    <RiCheckLine size={14} /> 완료 {safeCardData.likedCount}
                                                </>
                                                :
                                                <>
                                                    <RiThumbUpLine size={14} /> 추천 {safeCardData.likedCount}
                                                </>
                                        }
                                    </Button>
                            }
                        </div>
                    </CardHeader>
                    <Divider />
                    <div className="px-3 pt-3 text-sm font-semibold">리뷰 <span className="text-xs text-gray-500">({safeCardData.courseComments.length})</span></div>
                    <CardBody className="items-center flex-col gap-3">
                        <ReviewList data={safeCardData.courseComments} />
                        <ReviewInput
                            courseId={safeCardData.id}
                            getSingleCourse={getSingleCourse}
                            onReviewAdded={handleReviewAdded}
                        />
                    </CardBody>
                </Card>
            }
        </>
    )
}