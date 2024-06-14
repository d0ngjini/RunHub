import {RFeature, RFeatureUIEvent, RLayerVector} from "rlayers";
import {useCallback, useState} from "react";
import {LineString} from "ol/geom";
import {Fill, Stroke, Style} from "ol/style";
import {Feature} from "ol";

export default function ServerCourses(props: any) {
    const { towns, current, setCurrent, prevCourse, serverCourses, isDrawState, config, getSingleCourse } = props;
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>();

    const selectStyles = [
        new Style({
            stroke: new Stroke({
                color: config.hlStrokeColor,
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
                color: config.hlStrokeColor,
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

    return (
        <>
            <RLayerVector
                zIndex={5}
                style={towns}
                onPointerEnter={
                    useCallback((e: any) => {
                        e.target.setStyle(selectStyles);
                        setSelectedFeature(e.target);
                        e.map.getTargetElement().style.cursor = 'pointer'
                    }, [selectedFeature])
                }
                onPointerLeave={
                    useCallback((e: any) => {
                        if (selectedFeature === e.target) {
                            setSelectedFeature(null);
                            e.target.setStyle(defaultStyles);
                            e.map.getTargetElement().style.cursor = 'auto'
                        }
                    }, [selectedFeature])
                }
            >
                {
                    !isDrawState &&
                    serverCourses.map((course: any, i: number) => (
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