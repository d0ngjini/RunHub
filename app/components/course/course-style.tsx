import {RStroke, RStyle, RStyleArray} from "rlayers/style";
import {useCallback} from "react";
import {Feature} from "ol";
import {Geometry} from "ol/geom";

export default function CourseStyle(props: any) {
    const { towns, currentStyles, config } = props;

    const {
        baseStrokeColor,
        defBaseStrokeWidth,
        defHLStrokeWidth,
        hlStrokeColor,
        newBaseStrokeWidth,
        newHLStrokeWidth,
    } = config;

    return (
        <>

            <RStyleArray
                ref={towns}
                render={useCallback((feature: Feature<Geometry>) => {
                    return (
                        <>
                            <RStyle zIndex={1}>
                                <RStroke color={hlStrokeColor} width={defHLStrokeWidth}/>
                            </RStyle>
                            <RStyle zIndex={0}>
                                <RStroke color={baseStrokeColor} width={defBaseStrokeWidth}/>
                            </RStyle>
                        </>
                    )
                }, [baseStrokeColor, defBaseStrokeWidth, defHLStrokeWidth, hlStrokeColor])}
            />

            <RStyleArray
                ref={currentStyles}
                render={useCallback((feature: Feature<Geometry>) => {
                    return (
                        <>
                            <RStyle zIndex={1}>
                                <RStroke color={hlStrokeColor} width={newHLStrokeWidth}/>
                            </RStyle>
                            <RStyle zIndex={0}>
                                <RStroke color={newBaseStrokeWidth} width={newBaseStrokeWidth}/>
                            </RStyle>
                        </>
                    )
                }, [hlStrokeColor, newBaseStrokeWidth, newHLStrokeWidth])}
            />
        </>
    )
}