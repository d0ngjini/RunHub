import {RStroke, RStyle, RStyleArray} from "rlayers/style";
import {useCallback} from "react";
import {Feature} from "ol";
import {Geometry} from "ol/geom";

export default function CourseStyle(props: any) {
    const { towns, currentStyles } = props;

    return (
        <>
            <RStyleArray
                ref={towns}
                render={useCallback((feature: Feature<Geometry>) => {
                    return (
                        <>
                            <RStyle zIndex={1}>
                                <RStroke color="#f96d00" width={3}/>
                            </RStyle>
                            <RStyle zIndex={0}>
                                <RStroke color="#f2f2f2" width={8}/>
                            </RStyle>
                        </>
                    )
                }, [])}
            />

            <RStyleArray
                ref={currentStyles}
                render={useCallback((feature: Feature<Geometry>) => {
                    return (
                        <>
                            <RStyle zIndex={1}>
                                <RStroke color="#f96d00" width={8}/>
                            </RStyle>
                            <RStyle zIndex={0}>
                                <RStroke color="#f2f2f2" width={12}/>
                            </RStyle>
                        </>
                    )
                }, [])}
            />
        </>
    )
}