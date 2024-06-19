import {RFeature, RFeatureUIEvent, RLayerVector} from "rlayers";
import {useCallback, useEffect, useState} from "react";
import {LineString} from "ol/geom";
import {Fill, Stroke, Style} from "ol/style";
import {Feature} from "ol";
import {useSession} from "next-auth/react";
import {Course} from "@prisma/client";

export default function ServerCourses(props: any) {
    const { towns, current, setCurrent, prevCourse, serverCourses, isDrawState, config, getSingleCourse } = props;
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>();
    const [myCourses, setMyCourses] = useState<Course[]>([]);
    const [otherCourses, setOtherCourses] = useState<Course[]>([]);

    const selectStyles = [
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
        })
    ];

    const defaultStyles = [
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
        })
    ]

    const myStyles = [
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
        })
    ]

    const myStylesHighlight = [
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
        })
    ]


    const { data: session } = useSession();

    useEffect(() => {
        const myArr: Course[] = [];
        const otherArr: Course[] = [];

        console.log('session', session);
        console.log('serverCourses', serverCourses);

        if (session === null) {
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
    }, [serverCourses]);

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
                onPointerLeave={
                    useCallback((e: any) => {
                        setSelectedFeature(null);
                        e.target.setStyle(myStyles);
                        e.map.getTargetElement().style.cursor = 'auto'
                    }, [serverCourses, selectedFeature])
                }
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
                onPointerLeave={
                    useCallback((e: any) => {
                        setSelectedFeature(null);
                        e.target.setStyle(defaultStyles);
                        e.map.getTargetElement().style.cursor = 'auto'
                    }, [serverCourses, selectedFeature])
                }
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