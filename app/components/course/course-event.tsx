import {RFeature, RFeatureUIEvent, RLayerVector} from "rlayers";
import dayjs from "dayjs";

export default function CourseEvent(props: any) {
    const {current, currentStyles, getSingleCourse} = props;

    return (
        <>
            <RLayerVector zIndex={10} style={currentStyles}>
                {
                    current ? (
                        <div>
                            <RFeature geometry={current.getGeometry()} onSingleClick={(e: RFeatureUIEvent) => {
                                getSingleCourse(e.target.getProperties().id)
                            }}
                            properties={
                              {
                                  'name': current.getProperties().name,
                                  'id': current.getProperties().id,
                              }
                            }/>
                        </div>
                    ) : null
                }
            </RLayerVector>
        </>
    )
};