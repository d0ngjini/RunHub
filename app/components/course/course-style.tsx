import {RStroke, RStyle, RStyleArray} from "rlayers/style";
import {useCallback} from "react";
import {Feature} from "ol";
import {Geometry} from "ol/geom";

export default function CourseStyle(props: any) {
    const { towns, currentStyles, config } = props;

    return (
        <>

            <RStyleArray
                ref={towns}
                render={useCallback((feature: Feature<Geometry>) => {
                    return (
                        <>
                            <RStyle zIndex={1}>
                                <RStroke color={config.hlStrokeColor} width={config.defHLStrokeWidth}/>
                            </RStyle>
                            <RStyle zIndex={0}>
                                <RStroke color={config.baseStrokeColor} width={config.defBaseStrokeWidth}/>
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
                                <RStroke color={config.hlStrokeColor} width={config.newHLStrokeWidth}/>
                            </RStyle>
                            <RStyle zIndex={0}>
                                <RStroke color={config.newBaseStrokeWidth} width={config.newBaseStrokeWidth}/>
                            </RStyle>
                        </>
                    )
                }, [])}
            />
        </>
    )
}