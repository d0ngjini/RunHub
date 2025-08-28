import useSWR from 'swr';

// API 응답 타입 정의
interface CourseApiResponse {
    status: number;
    message?: string;
    content: {
        id: string;
        name: string;
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
    };
}

// fetcher 함수
const fetcher = async (url: string): Promise<CourseApiResponse> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
    }
    return response.json();
};

// useSingleCourse 훅
export const useSingleCourse = (courseId: string | null) => {
    const { data, error, isLoading, mutate } = useSWR<CourseApiResponse>(
        courseId ? `/api/courses/${courseId}` : null,
        fetcher,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            errorRetryCount: 3,
            refreshInterval: 0, // 자동 갱신 비활성화
            dedupingInterval: 1000, // 1초 내 중복 요청 방지
        }
    );

    return {
        course: data?.content,
        isLoading,
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
