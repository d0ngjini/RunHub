import {RFeature, RFeatureUIEvent, RInteraction, RLayerVector, RMap, ROSM} from "rlayers";
import {fromLonLat} from "ol/proj";
import {Geometry, LineString, Point} from "ol/geom";
import {
    useCallback,
    useEffect,
    useState
} from "react";
import {never} from "ol/events/condition";

import {
    Button,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    Textarea,
    useDisclosure
} from "@nextui-org/react";

import {RStroke, RStyle, RStyleArray, RText, useRStyle} from "rlayers/style";
import {Feature} from "ol";
import {Card, CardBody, CardHeader} from "@nextui-org/card";
import {SignInButton} from "@/app/components/sign-in";
import dayjs from "dayjs";
import ReviewList from "./review-list";
import CreateCourse from "@/app/components/course/create-course";
import CourseCard from "@/app/components/course/course-card";
import CourseStyle from "./course/course-style";
import CourseEvent from "@/app/components/course/course-event";
import {Course} from "@prisma/client";
import ServerCourses from "@/app/components/course/server-courses";

export default function Map() {
    const { isOpen, onOpen, onClose } = useDisclosure();

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

    return (
        <>
            <div className={"z-40 w-full absolute top-4 pr-4 flex justify-end"}>
                <div className={"flex gap-2"}>
                    <Button color={'primary'} onClick={(e: any) => {
                        setDrawState(!isDrawState);
                    }}>그리기</Button>
                    <SignInButton/>
                </div>
            </div>

            <CourseCard isCardHidden={isCardHidden} cardData={cardData} />
            <CourseStyle towns={ towns } currentStyles={ currentStyles } />

            <RMap className='example-map w-screen h-screen'
                  initial={{center: fromLonLat([126.734086, 37.715133]), zoom: 12}}>
                <ROSM/>
                <CourseEvent current={ current } currentStyles={ currentStyles } setCardData={ setCardData } setCardHidden={ setCardHidden }/>
                <ServerCourses
                    towns={ towns }
                    current={ current }
                    setCurrent={ setCurrent }
                    prevCourse={ prevCourse }
                    serverCourses={ serverCourses }
                    isDrawState={ isDrawState }
                />

                <RLayerVector zIndex={0}>
                    {
                        isDrawState &&
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
                    }
                </RLayerVector>
            </RMap>
            <CreateCourse drawnCourse = { drawnCourse } isOpen={ isOpen } onClose={ onClose } setDrawState={ setDrawState } getCourses={ getCourses }/>
        </>
    )
}