export default function ReviewList(props: any) {
    if (props.hasOwnProperty('data') && props.data.length > 0) {
        return (
            props.data.map((d: any) => {

            })
        )
    }

    return (
        <>
            <p className="text-xs text-gray-500">등록된 리뷰가 없네요! 첫번째 리뷰를 작성해주세요 😉</p>
        </>
    )
}