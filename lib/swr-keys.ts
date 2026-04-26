/** 지도·탐색에서 공유하는 SWR 캐시 키 (mutate 시 문자열이 정확히 같아야 함) */
export const SWR_COURSES_LIST = "/api/courses" as const;
export const SWR_COURSES_TRENDING = "/api/courses/trending?limit=8" as const;

/** 러닝 커뮤니티 피드 (최신 게시글) */
export const SWR_FEED = "/api/feed?limit=30&page=0" as const;
/** 지도 우측 피드 위젯(스냅샷) */
export const SWR_FEED_MAP_WIDGET = "/api/feed?limit=5&page=0" as const;
