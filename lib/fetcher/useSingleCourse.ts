import useSWR from "swr";

/** GET /api/courses + GET /api/courses/:id 가 공유하는 SWR 캐시 페이로드 */
export type CourseApiResponse = {
    status: number;
    message?: string;
    content: {
        id: string;
        name: string;
        userId?: string | null;
        address: string | null;
        flatCoordinates: string;
        extent: string | null;
        description: string;
        createdAt: string;
        courseComments: Array<{
            id: string;
            courseId: string;
            authorId: string;
            comment: string;
            createdAt: string;
            User: {
                name: string | null;
            } | null;
        }>;
        isLiked: boolean;
        likedCount: number;
        avgRating?: number;
        ratingCount?: number;
        userRating?: number;
        isBookmarked?: boolean;
    };
};

/** 코스 목록 API 행(한 줄) → 상세 SWR 캐시에 넣을 수 있는 1차 데이터(댓글·상호작용은 revalidate로 채움) */
export function listCourseRowToSwrData(row: {
    id: string;
    name: string;
    userId: string | null;
    address: string | null;
    flatCoordinates: string;
    extent: string | null;
    description: string;
    createdAt: string | Date;
}): CourseApiResponse {
    const createdAtStr =
        typeof row.createdAt === "string" ? row.createdAt : row.createdAt.toISOString();
    return {
        status: 200,
        content: {
            id: row.id,
            name: row.name,
            userId: row.userId,
            address: row.address,
            flatCoordinates: row.flatCoordinates,
            extent: row.extent,
            description: row.description,
            createdAt: createdAtStr,
            courseComments: [],
            isLiked: false,
            likedCount: 0,
            avgRating: 0,
            ratingCount: 0,
            userRating: 0,
            isBookmarked: false,
        },
    };
}

/** 트렌딩 등 목록에 없는 id만 있을 때 대화상자 먼저 띄우기용(백그라운드 revalidate) */
export function minimalCourseSwrData(id: string, name: string): CourseApiResponse {
    return {
        status: 200,
        content: {
            id,
            name: name || "코스",
            userId: null,
            address: null,
            flatCoordinates: "[]",
            extent: null,
            description: "",
            createdAt: new Date().toISOString(),
            courseComments: [],
            isLiked: false,
            likedCount: 0,
            avgRating: 0,
            ratingCount: 0,
            userRating: 0,
            isBookmarked: false,
        },
    };
}

// fetcher 함수
const fetcher = async (url: string): Promise<CourseApiResponse> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("데이터를 불러오는데 실패했습니다.");
    }
    return response.json();
};

// useSingleCourse 훅
export const useSingleCourse = (courseId: string | null) => {
    const { data, error, isLoading, isValidating, mutate } = useSWR<CourseApiResponse>(
        courseId ? `/api/courses/${courseId}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            errorRetryCount: 2,
            refreshInterval: 0, // 자동 갱신 비활성화
            dedupingInterval: 3000,
        }
    );

    return {
        course: data?.content,
        isLoading,
        isValidating,
        isError: error,
        error,
        mutate,
        // 안전한 기본값 설정
        isLiked: data?.content?.isLiked ?? false,
        likedCount: data?.content?.likedCount ?? 0,
        comments: data?.content?.courseComments ?? [],
        // 추가 안전성 체크
        hasComments: Array.isArray(data?.content?.courseComments) && data.content.courseComments.length > 0,
    };
};
