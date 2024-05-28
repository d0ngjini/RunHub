import {RInteraction, RLayerVector, RMap, ROSM} from "rlayers";
import {fromLonLat} from "ol/proj";
import {Geometry} from "ol/geom";
import {useEffect, useState} from "react";
import {never} from "ol/events/condition";

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

                console.log('조회된 코스', courses);
                setServerCourses(courses);
            });
    }

    useEffect(() => {
        getCourses();
    }, [])

    const towns = useRStyle();
    const currentStyles = useRStyle();

    const getSingleCourse = (id: string) => {
        fetch('/api/courses/' + id, {
            method: 'GET',
        })
        .then(res => res.json())
        .then(data => {
            data.content.createdAt = dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss')
            setCardData(data.content);
            setCardHidden(true);
        });
    }

    return (
        <>
            <SignInButton setDrawState={setDrawState} drawState={isDrawState} />
            <CourseCard isCardHidden={isCardHidden} cardData={cardData} setCardHidden={setCardHidden} getSingleCourse={getSingleCourse}/>
            <CourseStyle towns={towns} currentStyles={currentStyles}/>

            <RMap className='example-map w-screen h-screen'
                  initial={{center: fromLonLat([126.734086, 37.715133]), zoom: 12}}>
                <ROSM/>
                <CourseEvent current={current} currentStyles={currentStyles} setCardData={setCardData}
                             setCardHidden={setCardHidden} getSingleCourse={getSingleCourse}/>
                <ServerCourses
                    towns={towns}
                    current={current}
                    setCurrent={setCurrent}
                    prevCourse={prevCourse}
                    serverCourses={serverCourses}
                    isDrawState={isDrawState}
                />

                {
                    isDrawState &&
                    <RLayerVector zIndex={0}>
                        <RInteraction.RDraw
                            type={"LineString"}
                            condition={e => {
                                return e.type === 'pointerdown';
                            }}
                            freehandCondition={never}
                            onDrawEnd={(e: any) => {
                                // @ts-ignore
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