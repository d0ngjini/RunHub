import {Card, CardBody, CardHeader} from "@nextui-org/card";
import ReviewList from "@/app/components/review-list";
import {Button, Image, Textarea} from "@nextui-org/react";

export default function CourseCard(props: any) {
    const { isCardHidden, cardData } = props;

    return (
        <>
            {
                isCardHidden &&
                <Card className="absolute z-40 w-96 py-4 bottom-0 mb-4 right-1/2 translate-x-1/2">
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                        <small className="text-default-500">{cardData.createdAt}</small>
                        <h4 className="font-bold text-large">{cardData.name}</h4>
                        <p className="text-tiny uppercase font-bold">{cardData.description}</p>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2 items-center flex-col gap-3">
                        <ReviewList data={ cardData.reviews }/>
                        <div className="w-full flex gap-2 items-center">
                            <Textarea
                                variant="bordered"
                                maxRows={2}
                                label=""
                                placeholder="매너 리뷰 부탁드립니다."
                            />
                            <Button color="primary" variant={"faded"} isIconOnly>
                                <Image width={"24"} src="https://www.svgrepo.com/show/532154/check.svg"/>
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            }
        </>
    )
}