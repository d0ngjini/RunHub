import {RFeature, RLayerVector} from "rlayers";
import {useCallback} from "react";
import {LineString} from "ol/geom";

export default function ServerCourses(props: any) {
    const { towns, current, setCurrent, prevCourse, serverCourses, isDrawState } = props;

    return (
        <>
            <RLayerVector
                zIndex={5}
                style={towns}
                onPointerEnter={
                    useCallback((e: any) => {
                        setCurrent(e.target);
                        e.map.getTargetElement().style.cursor = 'pointer'
                    }, [current, prevCourse, serverCourses])
                }
                onPointerLeave={
                    useCallback((e: any) => {
                        if (current === e.target) {
                            setCurrent(null);
                            e.map.getTargetElement().style.cursor = 'auto'
                        }
                    }, [current, prevCourse, serverCourses])
                }
            >
                {
                    !isDrawState && serverCourses.map((course : any, i : number) => (
                        <RFeature key={i} geometry={new LineString(course.flatCoordinates)} properties={{
                            id: course.id,
                            name: course.name,
                        }}/>
                    ))
                }
            </RLayerVector>
        </>
    )
};