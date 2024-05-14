import {RFeature, RInteraction, RLayerVector, RMap, ROSM, ROverlay} from "rlayers";
import {fromLonLat} from "ol/proj";
import {Geometry, LineString, Point} from "ol/geom";
import {useCallback, useEffect, useState} from "react";
import {altShiftKeysOnly, click, never, shiftKeyOnly, singleClick} from "ol/events/condition";

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Input,
    Image,
    Textarea
} from "@nextui-org/react";
import {Extent} from "ol/interaction";

import {RStyle, RIcon, RFill, RStroke, RText, RStyleArray, useRStyle} from "rlayers/style";
import {Feature} from "ol";
import {Card, CardBody, CardHeader} from "@nextui-org/card";
import {signIn} from "@/app/auth";
import {SignInButton} from "@/app/components/sign-in";

interface Course {
    id: number;
    name: string;
    address: string;
    flatCoordinates: number[][];
    description?: string;
    extent?: number[][];
    date: string;
}

export default function MainMap() {
    const [isDrawState, setDrawState] = useState<boolean>(false);
    const [serverCourses, setServerCourses] = useState<Course[]>([]);
    const [current, setCurrent] = useState(
        null as Feature<Geometry> | null
    );

    const [prevCourse, setPrevCourse] = useState<Course | null>(null);

    function getCourses() {
        const courses = fetch('/api/getCourses');
        courses
            .then(res => res.json())
            .then(data => {
                const arr: Course[] = [];

                data.content.forEach((d: any) => {
                    const course: Course = {
                        id: d.id,
                        name: d.name,
                        address: d.address,
                        flatCoordinates: JSON.parse(d.flatCoordinates),
                        description: d.description,
                        extent: d.extent,
                        date: d.convertedDate,
                    }

                    arr.push(course)
                });

                console.log('arr', arr);

                setServerCourses(arr);
            })
    }

    useEffect(() => {
        getCourses();
    }, [])

    const { isOpen, onOpen, onClose } = useDisclosure();
    const initCourse: Course = {
        id: -1,
        name: '',
        address: '',
        flatCoordinates: [],
    }

    const [course, setCourse] = useState(initCourse);
    const [isSetDefaultLocation, setDefaultLocation] = useState(false);

    const onOpenChange = async function (isOpen: boolean) {
        if (isOpen) {

        } else {
            onClose();
            setDefaultLocation(false);
        }
    };

    const handleSubmit = async function (e : any) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const entries = Object.fromEntries(formData.entries());

        entries.flatCoordinates = JSON.stringify(course.flatCoordinates)

        if (confirm('코스를 저장하시겠습니까?')) {
            await fetch('/api/createCourse', {
                method: 'POST',
                body: JSON.stringify(entries)
            })
                .then(res => res.json())
                .then(json => {
                    if (json.status === 200) {
                        alert('데이터 성공에 처리했습니다.');
                    } else if (json.status === 401) {
                        alert('로그인 정보가 없습니다.');
                    } else {
                        alert('데이터 처리 중 오류가 발생했습니다.');
                    }

                    setDrawState(false);
                    getCourses();
                    onClose();
                });
        }
    };

    const towns = useRStyle();
    const currentStyles = useRStyle();

    // prisma 데이터 삽입처리
    const [isCardHidden, setCardHidden] = useState(false);
    const [cardData, setCardData] = useState<object>({});

    return (
        <>
            {
                isCardHidden &&
                <Card className="absolute z-40 w-96 py-4 bottom-0 mb-4 right-1/2 translate-x-1/2">
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                        <small className="text-default-500">{cardData.date}</small>
                        <h4 className="font-bold text-large">{cardData.name}</h4>
                        <p className="text-tiny uppercase font-bold">{cardData.description}</p>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                        <Image
                            alt="Card background"
                            className="object-cover rounded-xl"
                            src="https://nextui.org/images/hero-card-complete.jpeg"
                            width={270}
                        />
                    </CardBody>
                </Card>
            }


            <div className={"z-40 absolute top-4 right-4 flex flex-col gap-2"}>
                <Button color={'primary'} onClick={(e: any) => {
                    setDrawState(!isDrawState);
                }}>그리기</Button>

                <SignInButton />
            </div>


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
            <RMap className='example-map w-screen h-screen' initial={{center: fromLonLat([126.734086, 37.715133]), zoom: 12}}>
                <ROSM/>
                <RLayerVector
                    zIndex={10}
                    style={towns}
                    onPointerEnter={
                        useCallback((e: any) => {
                            // console.log('enter feature', e)
                            const newCourses = serverCourses.slice();
                            setCurrent(e.target);
                            // setServerCourses(newCourses);
                            e.map.getTargetElement().style.cursor = 'pointer'
                        }, [current, prevCourse, serverCourses])
                    }
                    onPointerLeave={
                        useCallback((e: any) => {
                            // setServerCourses([...serverCourses, prevCourse]);
                            // console.log('포인터 리브 후 코스들', serverCourses);
                            if (current === e.target) {
                                setCurrent(null);
                                e.map.getTargetElement().style.cursor = 'auto'
                            }
                        }, [current, prevCourse, serverCourses])
                    }
                >
                    {
                        !isDrawState && serverCourses.map((course, i) => (
                            <RFeature key={i} geometry={ new LineString(course.flatCoordinates) } properties={{
                                id: course.id,
                                name: course.name,
                            }}/>
                        ))
                    }
                </RLayerVector>

                <RLayerVector zIndex={10} style={currentStyles}>
                    {
                        current ? (
                            <div>
                                <RFeature geometry={current.getGeometry()} onSingleClick={ async (e: any) => {
                                    await fetch('/api/getSingleCourse', {
                                        method: 'POST',
                                        body: JSON.stringify({
                                            id: e.target.getProperties().id,
                                            name: e.target.getProperties().name,
                                        })
                                    })
                                        .then(res => res.json())
                                        .then(data => {
                                            console.log('data', data.content);
                                            setCardData(data.content);
                                            setCardHidden(true);
                                        })
                                }}
                                properties={
                                    {
                                        'name': current.getProperties().name,
                                        'id': current.getProperties().id,
                                    }
                                }>
                                    {/*<ROverlay className="example-overlay" autoPosition={false}>*/}
                                    {/*    테스트*/}
                                    {/*</ROverlay>*/}
                                </RFeature>
                            </div>
                        ) : null
                    }
                </RLayerVector>

                <RLayerVector zIndex={10}>
                    <RFeature
                        geometry={new Point(fromLonLat([2.295, 48.8737]))}
                        onClick={(e: any) =>
                            e.map.getView().fit(e.target.getGeometry().getExtent(), {
                                duration: 250,
                                maxZoom: 15
                            })
                        }
                    >
                    </RFeature>
                </RLayerVector>

                <RLayerVector zIndex={0}>
                    {
                        isDrawState &&
                        <RInteraction.RDraw
                            type={"LineString"}
                            condition={e => {
                                return e.type === 'pointerdown';
                            }}
                            freehandCondition={never}
                            onDrawEnd={(e)=> {
                                setCourse({...course,
                                    flatCoordinates: e.feature.getGeometry().getCoordinates(),
                                    extent: e.feature.getGeometry().getExtent(),
                                });
                                onOpen();
                            }}
                        />
                    }
                </RLayerVector>
            </RMap>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">그려진 경로를 저장합니다.</ModalHeader>
                            <ModalBody>
                                <form method="post" onSubmit={handleSubmit}>
                                    <div className="flex w-full flex-wrap md:flex-nowrap gap-4 mb-2">
                                        <Input isRequired type="text" name="name" label="코스명"/>
                                    </div>
                                    <div className="flex w-full flex-wrap md:flex-nowrap gap-4 mb-2">
                                        <Textarea isRequired type="text" name={"description"} label="설명"/>
                                    </div>
                                    <div className="flex w-full flex-wrap md:flex-nowrap gap-4 mb-2 hidden">
                                        <Input type="hidden" label="코스좌표" name={"flatCoordinates"} value={course.flatCoordinates} readOnly={true}/>
                                    </div>

                                    <div className="w-full h-48 mb-4">
                                        <RMap className='w-full h-full'
                                              initial={{center: fromLonLat([2.364, 48.82]), zoom: 11}}
                                              onPostRender={
                                                  e => {
                                                      if (isSetDefaultLocation) {
                                                          return;
                                                      } else {
                                                          setDefaultLocation(true)
                                                          e.target.getView().fit(course.extent, {
                                                              padding: [30, 20, 20, 20]
                                                          })
                                                      }
                                                  }
                                              }
                                        >
                                            <ROSM/>
                                            <RLayerVector zIndex={10}>
                                                <RFeature geometry={new LineString(course.flatCoordinates)}>
                                                    <RStyle zIndex={1}>
                                                        <RStroke color="#f96d00" width={3}/>
                                                    </RStyle>
                                                </RFeature>
                                                <RFeature geometry={new LineString(course.flatCoordinates)}>
                                                    <RStyle zIndex={0}>
                                                        <RStroke color="#f2f2f2" width={8}/>
                                                    </RStyle>
                                                </RFeature>
                                                <RFeature geometry={new Point(course.flatCoordinates[0])}>
                                                    <RStyle zIndex={3}>
                                                        <RText text={'시작'} font={'bold 12px consolas'} offsetY={-5}>
                                                            <RStroke color={'white'} width={2}/>
                                                        </RText>
                                                    </RStyle>
                                                </RFeature>
                                                <RFeature
                                                    geometry={new Point(course.flatCoordinates[course.flatCoordinates.length - 1])}>
                                                    <RStyle zIndex={3}>
                                                        <RStroke color={'white'} width={1}/>
                                                        <RText text={'끝'} font={'bold 12px consolas'} offsetY={-10}>
                                                            <RStroke color={'white'} width={2}/>
                                                        </RText>
                                                    </RStyle>
                                                </RFeature>
                                            </RLayerVector>
                                        </RMap>
                                    </div>
                                    <div className="w-full text-right mb-2">
                                        <Button color="primary" type="submit">
                                            저장
                                        </Button>
                                    </div>
                                </form>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}