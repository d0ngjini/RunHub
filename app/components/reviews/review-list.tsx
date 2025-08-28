import { Chip, Divider } from "@nextui-org/react";
import Avatar from "boring-avatars";
import dayjs from "dayjs";

export default function ReviewList(props: any) {
    if (props.hasOwnProperty('data') && props.data.length > 0) {
        return (
            <div className="max-h-52 w-full overflow-y-auto flex flex-col gap-2 pr-2" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#d1d5db #f3f4f6'
            }}>
                {
                    props.data.map((d: any, index: number) => (
                        <div key={d.id || index} className="flex flex-col gap-2">
                            <div className="flex flex-col gap-2 justify-between text-sm">
                                <div className="max-w-64 break-words">{d.comment}</div>
                                <div className="flex items-center gap-1">
                                    <Chip
                                        variant="flat"
                                        avatar={
                                            <Avatar
                                                size={20}
                                                name={d.User?.name || '익명'}
                                                variant="beam"
                                                colors={['#fcfcfc', '#ff5400', '#6c6c6c', '#7cff00', '#DF8615']}
                                            />
                                        }
                                    >
                                        {d.User?.name || '익명'}
                                    </Chip>
                                    <span
                                        className="before:content-['·_'] text-gray-500 text-xs"
                                    >{dayjs(d.createdAt).format('YYYY-MM-DD')}
                                    </span>
                                </div>
                            </div>
                            <Divider className="m-0" />
                        </div>
                    ))
                }
            </div>
        )
    }

    return (
        <>
            <p className="text-sm italic py-2">첫번째 리뷰어가 되어주세요!</p>
        </>
    )
}