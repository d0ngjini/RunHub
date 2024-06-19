import {MapBrowserEvent, RInteraction, RLayerVector, RMap, ROSM} from "rlayers";
import {fromLonLat} from "ol/proj";
import {Geometry} from "ol/geom";
import {useEffect, useState} from "react";
import {mouseOnly, never, shiftKeyOnly, singleClick, touchOnly} from "ol/events/condition";

import {Button, useDisclosure} from "@nextui-org/react";

import {useRStyle} from "rlayers/style";
import {Feature} from "ol";
import {SignInButton} from "@/app/components/sign-in";
import CreateCourse from "@/app/components/course/create-course";
import CourseCard from "@/app/components/course/course-card";
import CourseStyle from "./course/course-style";
import CourseEvent from "@/app/components/course/course-event";
import {Course} from "@prisma/client";
import ServerCourses from "@/app/components/course/server-courses";
import dayjs from "dayjs";
import {Simulate} from "react-dom/test-utils";
import pointerDown = Simulate.pointerDown;

export default function Map() {
    const {isOpen, onOpen, onClose} = useDisclosure();

    const [isDrawState, setDrawState] = useState<boolean>(false);
    const [serverCourses, setServerCourses] = useState<Course[]>([]);
    const [current, setCurrent] = useState(
        null as Feature<Geometry> | null
    );
    const [prevCourse, setPrevCourse] = useState<clientCourse | null>(null);
    const [isCardHidden, setCardHidden] = useState(false);
    const [cardData, setCardData] = useState({
        name: "",
        createdAt: "",
        description: "",
        reviews: [],
    });

    const [drawnCourse, setDrawnCourse] = useState({
        date: "",
        description: "",
        extent: [],
        id: -1,
        name: '',
        address: '',
        flatCoordinates: []
    });

    function getCourses() {
        const courses = fetch('/api/courses', {
            method: 'GET',
        });

        courses
            .then(res => res.json())
            .then(data => {
                const courses: Course[] = [];

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

                    courses.push(course)
                });

                setServerCourses(courses);
            });
    }

    useEffect(() => {
        getCourses();
    }, [])

    const towns = useRStyle();
    const currentStyles = useRStyle();

    const getSingleCourse = async (id: string) => {
        await fetch('/api/courses/' + id, {
            method: 'GET',
        })
        .then(res => res.json())
        .then(data => {
            data.content.createdAt = dayjs(data.content.createdAt).format('YYYY-MM-DD HH:mm:ss')
            setCardData(data.content);
            setCardHidden(true);
        });
    }

    const featureConfig = {
        baseStrokeColor: 'rgba(255,255,255,0.5)',
        mainStrokeColor: 'rgba(255,108,0,0.7)',
        defBaseStrokeWidth: 7,
        defHLStrokeWidth: 3,
        newBaseStrokeWidth: 12,
        newHLStrokeWidth: 8,
        myStrokeColor: 'rgba(0,212,255,0.7)',
        myHlStrokeColor: 'rgba(0,212,255,0.7)'
    }

    return (
        <>
            <SignInButton setDrawState={setDrawState} drawState={isDrawState} />
            <CourseCard isCardHidden={isCardHidden} cardData={cardData} setCardData={setCardData} setCardHidden={setCardHidden} getSingleCourse={getSingleCourse} getCourses={getCourses}/>
            <CourseStyle towns={towns} currentStyles={currentStyles} config={featureConfig}/>

            <RMap className='example-map w-screen h-screen'
                  initial={{center: fromLonLat([126.734086, 37.715133]), zoom: 12}}>
                <ROSM/>
                {/*<CourseEvent config={featureConfig} getSingleCourse={getSingleCourse}/>*/}
                <ServerCourses
                    towns={towns}
                    current={current}
                    setCurrent={setCurrent}
                    prevCourse={prevCourse}
                    serverCourses={serverCourses}
                    isDrawState={isDrawState}
                    config={featureConfig}
                    getSingleCourse={getSingleCourse}
                />

                {
                    isDrawState &&
                    <RLayerVector zIndex={0}>
                        <RInteraction.RDraw
                            type={"LineString"}
                            condition={(e: MapBrowserEvent<any>) => {
                                console.log('e', e)
                                return e.type === 'pointerdown' || e.type === 'touchdown'
                            }}
                            freehandCondition={never}
                            onDrawEnd={(e: any) => {
                                setDrawnCourse({
                                    ...drawnCourse,
                                    flatCoordinates: e.feature.getGeometry().getCoordinates(),
                                    extent: e.feature.getGeometry().getExtent(),
                                });
                                onOpen();
                            }}
                        />
                    </RLayerVector>
                }
            </RMap>
            <CreateCourse drawnCourse={drawnCourse}
                          setDrawnCourse={setDrawnCourse}
                          isOpen={isOpen}
                          onClose={onClose}
                          setDrawState={setDrawState}
                          getCourses={getCourses}/>
        </>
    )
}