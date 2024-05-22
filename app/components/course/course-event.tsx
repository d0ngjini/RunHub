import {RFeature, RFeatureUIEvent, RLayerVector} from "rlayers";
import dayjs from "dayjs";
import {RStroke, RStyle, RStyleArray, useRStyle} from "rlayers/style";
import {useCallback} from "react";
import {Feature} from "ol";
import {Geometry} from "ol/geom";

export default function CourseEvent(props: any) {
    const { current, currentStyles, setCardData, setCardHidden } = props;

    return (
        <>
            <RLayerVector zIndex={10} style={currentStyles}>
                {
                    current ? (
                        <div>
                            <RFeature geometry={current.getGeometry()} onSingleClick={(e: RFeatureUIEvent) => {
                                fetch('/api/courses/' + e.target.getProperties().id, {
                                    method: 'GET',
                                })
                                    .then(res => res.json())
                                    .then(data => {
                                        data.content.createdAt = dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss')
                                        setCardData(data.content);
                                        setCardHidden(true);
                                    });
                            }}
                                      properties={
                                          {
                                              'name': current.getProperties().name,
                                              'id': current.getProperties().id,
                                          }
                                      }>
                            </RFeature>
                        </div>
                    ) : null
                }
            </RLayerVector>
        </>
    )
};