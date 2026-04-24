import {RFeature, RFeatureUIEvent, RLayerVector} from "rlayers";
import {useCallback, useEffect, useMemo, useState} from "react";
import {LineString} from "ol/geom";
import {Fill, Stroke, Style} from "ol/style";
import {Feature} from "ol";
import { authClient } from "@/lib/auth-client";
import type { Course } from "@/lib/domain-types";

export default function ServerCourses(props: any) {
    const { towns, current, setCurrent, prevCourse, serverCourses, isDrawState, config, getSingleCourse } = props;
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>();
    const [myCourses, setMyCourses] = useState<Course[]>([]);
    const [otherCourses, setOtherCourses] = useState<Course[]>([]);

    const selectStyles = useMemo(() => ([
        new Style({
            stroke: new Stroke({
                color: config.mainStrokeColor,
                width: config.newHLStrokeWidth,
            }),
            zIndex: 1,
        }),
        new Style({
            stroke: new Stroke({
                color: config.baseStrokeColor,
                width: config.newBaseStrokeWidth,
            }),
        }),
    ]), [
        config.baseStrokeColor,
        config.mainStrokeColor,
        config.newBaseStrokeWidth,
        config.newHLStrokeWidth,
    ]);

    const defaultStyles = useMemo(() => ([
        new Style({
            stroke: new Stroke({
                color: config.mainStrokeColor,
                width: config.defHLStrokeWidth,
            }),
            zIndex: 1,
        }),
        new Style({
            stroke: new Stroke({
                color: config.baseStrokeColor,
                width: config.defBaseStrokeWidth,
            }),
        }),
    ]), [
        config.baseStrokeColor,
        config.defBaseStrokeWidth,
        config.defHLStrokeWidth,
        config.mainStrokeColor,
    ]);

    const myStyles = useMemo(() => ([
        new Style({
            stroke: new Stroke({
                color: config.myStrokeColor,
                width: config.defHLStrokeWidth,
            }),
            zIndex: 1,
        }),
        new Style({
            stroke: new Stroke({
                color: config.baseStrokeColor,
                width: config.defBaseStrokeWidth,
            }),
        }),
    ]), [
        config.baseStrokeColor,
        config.defBaseStrokeWidth,
        config.defHLStrokeWidth,
        config.myStrokeColor,
    ]);

    const myStylesHighlight = useMemo(() => ([
        new Style({
            stroke: new Stroke({
                color: config.myHlStrokeColor,
                width: config.newHLStrokeWidth,
            }),
            zIndex: 1,
        }),
        new Style({
            stroke: new Stroke({
                color: config.baseStrokeColor,
                width: config.newBaseStrokeWidth,
            }),
        }),
    ]), [
        config.baseStrokeColor,
        config.myHlStrokeColor,
        config.newBaseStrokeWidth,
        config.newHLStrokeWidth,
    ]);

    const { data: session } = authClient.useSession();

    useEffect(() => {
        const myArr: Course[] = [];
        const otherArr: Course[] = [];

        if (!session) {
            setOtherCourses(serverCourses);
        } else {
            serverCourses.forEach((course: any) => {
                if (course.userId === session.user?.id) {
                    myArr.push(course);
                } else {
                    otherArr.push(course);
                }
            });

            setMyCourses(myArr);
            setOtherCourses(otherArr);
        }
    }, [serverCourses, session]);

    const handleMyPointerLeave = useCallback((e: any) => {
        setSelectedFeature(null);
        e.target.setStyle(myStyles);
        e.map.getTargetElement().style.cursor = 'auto'
    }, [myStyles]);

    const handleOtherPointerLeave = useCallback((e: any) => {
        setSelectedFeature(null);
        e.target.setStyle(defaultStyles);
        e.map.getTargetElement().style.cursor = 'auto'
    }, [defaultStyles]);

    return (
        <>
            {/* 내가 만든 코스 스타일 */}
            <RLayerVector
                zIndex={4}
                onPointerEnter={(e) => {
                    setSelectedFeature(e.target);
                    e.target.setStyle(myStylesHighlight);
                    e.map.getTargetElement().style.cursor = 'pointer'
                }}
                onPointerLeave={handleMyPointerLeave}
                style={myStyles}
            >
                {
                    !isDrawState &&
                    myCourses.map((course: any, i: number) => (
                        <RFeature
                            key={i}
                            geometry={
                                new LineString(course.flatCoordinates)
                            }
                            properties={
                                {
                                    id: course.id,
                                    name: course.name,
                                }
                            }
                            onSingleClick={(e: RFeatureUIEvent) => {
                                getSingleCourse(e.target.getProperties().id)
                            }}
                        />
                    ))
                }
            </RLayerVector>
            {/* 다른 사람이 만든 코스 스타일 */}
            <RLayerVector
                zIndex={2}
                onPointerEnter={(e) => {
                    setSelectedFeature(e.target);
                    e.target.setStyle(selectStyles);
                    e.map.getTargetElement().style.cursor = 'pointer'
                }}
                onPointerLeave={handleOtherPointerLeave}
                style={defaultStyles}
            >
                {
                    !isDrawState &&
                    otherCourses.map((course: any, i: number) => (
                        <RFeature
                            key={i}
                            geometry={
                                new LineString(course.flatCoordinates)
                            }
                            properties={
                                {
                                    id: course.id,
                                    name: course.name,
                                }
                            }
                            onSingleClick={(e: RFeatureUIEvent) => {
                                getSingleCourse(e.target.getProperties().id)
                            }}
                        />
                    ))
                }
            </RLayerVector>
        </>
    );
};