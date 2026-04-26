"use client";

import { MapBrowserEvent, RFeature, RInteraction, RLayerTile, RLayerVector, RMap } from "rlayers";
import { fromLonLat } from "ol/proj";
import { Geometry } from "ol/geom";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { never } from "ol/events/condition";

import { RFill, RStroke, RStyle, useRStyle } from "rlayers/style";
import { Feature } from "ol";
import CreateCourse, { type DrawnCourseState } from "@/app/components/course/create-course";
import CourseCard from "@/app/components/course/course-card";
import CourseStyle from "./course/course-style";
import type { Course } from "@/lib/domain-types";
import ServerCourses from "@/app/components/course/server-courses";
import dayjs from "dayjs";
import {
    listCourseRowToSwrData,
    minimalCourseSwrData,
} from "@/lib/fetcher/useSingleCourse";
import useSWR, { useSWRConfig } from "swr";
import { useRequireAuth } from "@/components/auth/use-require-auth";
import { MapFloatingDock } from "@/components/app/map-floating-dock";
import { TrendingCoursesRail } from "@/components/app/trending-courses-rail";
import { FeedSnapshotRail } from "@/components/app/feed-snapshot-rail";
import { SWR_COURSES_LIST, SWR_COURSES_TRENDING, SWR_FEED_MAP_WIDGET } from "@/lib/swr-keys";

/**
 * 브이월드 WMTS 배경지도 — 타일 경로 `{z}/{tileRow}/{tileCol}` (VWorld 스펙).
 * 백지도(흑백) 레이어는 소문자 **`white`** (`White` 대문자는 타일 500).
 * `gray` = 회색 백지도, `Base` = 일반 지도 등은 `NEXT_PUBLIC_VWORLD_WMTS_LAYER`로 지정.
 */
const vworldBaseTileUrl = (() => {
  const k = process.env.NEXT_PUBLIC_VWORLD_TOKEN?.trim();
  if (!k) return null;
  const layer = (process.env.NEXT_PUBLIC_VWORLD_WMTS_LAYER ?? "white").trim();
  return `https://api.vworld.kr/req/wmts/1.0.0/${k}/${layer}/{z}/{y}/{x}.png` as const;
})();

const fallbackRasterUrl =
  "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" as const;

const swrListFetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Map() {
    const [isCreateCourseOpen, setCreateCourseOpen] = useState(false);
    const [isDrawState, setDrawState] = useState(false);
    const [current, setCurrent] = useState(
        null as Feature<Geometry> | null
    );
    const [courseDialogOpen, setCourseDialogOpen] = useState(false);
    const [cardData, setCardData] = useState<{
        id: string;
        name: string;
        createdAt: string;
        description: string;
        reviews: unknown[];
    }>({
        id: "",
        name: "",
        createdAt: "",
        description: "",
        reviews: [],
    });

    const [drawnCourse, setDrawnCourse] = useState<DrawnCourseState>({
        date: "",
        description: "",
        extent: [],
        id: -1,
        name: '',
        address: '',
        flatCoordinates: []
    });

    const { data, isLoading, mutate: mutateCourseList } = useSWR(SWR_COURSES_LIST, swrListFetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 2000,
    });
    const { mutate: mutateSWR } = useSWRConfig();
    const serverCourses: Course[] = [];
    const { requireAuth } = useRequireAuth();

    const refreshCourseLayers = useCallback(() => {
        void mutateCourseList();
        void mutateSWR(SWR_COURSES_TRENDING);
        void mutateSWR(SWR_FEED_MAP_WIDGET);
    }, [mutateCourseList, mutateSWR]);

    if (!isLoading && Array.isArray(data?.content)) {
        data.content.forEach((d: Course) => {
            const course: Course = {
                userId: d.userId,
                id: d.id,
                name: d.name,
                address: d.address,
                flatCoordinates: JSON.parse(d.flatCoordinates),
                description: d.description,
                extent: d.extent,
                createdAt: d.createdAt,
            }

            serverCourses.push(course)
        });
    }


    const towns = useRStyle();
    const currentStyles = useRStyle();

    type ListRow = {
        id: string;
        name: string;
        userId: string | null;
        address: string | null;
        flatCoordinates: string;
        extent: string | null;
        description: string;
        createdAt: string;
        convertedDate?: string;
    };

    const getSingleCourse = useCallback(
        (id: string, preview?: { name?: string }) => {
            const idStr = String(id).trim();
            if (!idStr) return;
            const key = `/api/courses/${idStr}`;
            const list = Array.isArray(data?.content) ? (data.content as ListRow[]) : [];
            const row = list.find((c) => String(c.id) === idStr);

            if (row) {
                void mutateSWR(key, listCourseRowToSwrData(row), { revalidate: true });
                setCardData((prev) => ({
                    ...prev,
                    id: String(row.id),
                    name: row.name,
                    description: row.description,
                    userId: row.userId ?? "",
                    createdAt: row.convertedDate ?? dayjs(row.createdAt).format("YYYY-MM-DD HH:mm:ss"),
                    courseComments: [],
                }));
            } else {
                void mutateSWR(
                    key,
                    minimalCourseSwrData(idStr, preview?.name?.trim() || "코스"),
                    { revalidate: true }
                );
                setCardData((prev) => ({
                    ...prev,
                    id: idStr,
                    name: preview?.name ?? prev.name ?? "",
                }));
            }
            setCourseDialogOpen(true);
        },
        [data, mutateSWR]
    );

    const featureConfig = {
        baseStrokeColor: "rgba(15,23,42,0.82)",
        mainStrokeColor: "rgba(96,165,250,0.92)",
        hlStrokeColor: "rgba(45,212,191,0.92)",
        defBaseStrokeWidth: 7,
        defHLStrokeWidth: 3,
        newBaseStrokeWidth: 12,
        newHLStrokeWidth: 8,
        myStrokeColor: "rgba(125,211,252,0.96)",
        myHlStrokeColor: "rgba(34,211,238,0.96)",
    };

    const metaBootstrapped = useRef(false);
    const mapSlotRef = useRef<HTMLDivElement | null>(null);
    const olMapRef = useRef<any>(null);

    useLayoutEffect(() => {
        RFeature.hitTolerance = 12;
    }, []);

    useLayoutEffect(() => {
        const el = mapSlotRef.current;
        if (!el || typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver(() => {
            try {
                olMapRef.current?.updateSize?.();
            } catch {
                /* noop */
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const onToggleCourseDraw = () => {
        if (!isDrawState) {
            if (!requireAuth({ type: "createCourse" })) return;
        }
        setDrawState((v) => !v);
    };

    return (
        <div className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
            <CourseCard
                courseDialogOpen={courseDialogOpen}
                cardData={cardData}
                setCardData={setCardData}
                setCourseDialogOpen={setCourseDialogOpen}
                getSingleCourse={getSingleCourse}
                onCourseListChanged={refreshCourseLayers}
            />
            <CourseStyle towns={towns} currentStyles={currentStyles} config={featureConfig} />

            <div ref={mapSlotRef} className="relative min-h-0 w-full flex-1">
                <RMap
                    className="absolute inset-0 z-0 h-full w-full"
                    initial={{ center: fromLonLat([126.734_086, 37.715_133]), zoom: 12 }}
                    onPostRender={(e) => {
                        const m: any = (e as any)?.map ?? (e as any)?.target;
                        if (!m?.getView) return;
                        olMapRef.current = m;
                        try {
                            m.updateSize?.();
                        } catch {
                            /* noop */
                        }
                        if (metaBootstrapped.current) return;
                        metaBootstrapped.current = true;
                    }}
                    onMoveEnd={(e) => {
                        olMapRef.current = e as unknown;
                    }}
                >

                <RLayerTile
                    properties={{ label: "VWorld-백지도(white)" }}
                    url={vworldBaseTileUrl ?? fallbackRasterUrl}
                    minZoom={5}
                    maxZoom={18}
                    crossOrigin="anonymous"
                />

                <ServerCourses
                    towns={towns}
                    current={current}
                    setCurrent={setCurrent}
                    serverCourses={serverCourses}
                    isDrawState={isDrawState}
                    config={featureConfig}
                    getSingleCourse={getSingleCourse}
                />
                {isDrawState && (
                    <RLayerVector zIndex={0}>
                        <RInteraction.RDraw
                            type={"LineString"}
                            condition={(e: MapBrowserEvent<any>) => e.type === "pointerdown" || e.type === "touchdown"}
                            freehandCondition={never}
                            onDrawEnd={(e: any) => {
                                setDrawnCourse({
                                    ...drawnCourse,
                                    flatCoordinates: e.feature.getGeometry().getCoordinates(),
                                    extent: e.feature.getGeometry().getExtent(),
                                });
                                setCreateCourseOpen(true);
                            }}
                        />
                    </RLayerVector>
                )}
                </RMap>
            </div>

            <div className="pointer-events-none absolute right-0 top-0 z-20 p-2 pt-3 sm:p-3 sm:pt-4">
                <div className="flex w-max min-w-0 max-w-full flex-col gap-2">
                    <TrendingCoursesRail
                        onPickCourse={(id, name) => {
                            getSingleCourse(id, { name });
                        }}
                    />
                    <FeedSnapshotRail />
                </div>
            </div>

            <MapFloatingDock
                isDrawActive={isDrawState}
                onCourseCreate={onToggleCourseDraw}
            />

            <CreateCourse
                drawnCourse={drawnCourse}
                setDrawnCourse={setDrawnCourse}
                isOpen={isCreateCourseOpen}
                onClose={() => setCreateCourseOpen(false)}
                setDrawState={setDrawState}
                onSaved={refreshCourseLayers}
            />
        </div>
    )
}
