import {Button, Input, Modal, ModalBody, ModalContent, ModalHeader, Textarea} from "@nextui-org/react";
import {RFeature, RLayerVector, RMap, ROSM} from "rlayers";
import {fromLonLat} from "ol/proj";
import {LineString, Point} from "ol/geom";
import {RStroke, RStyle, RText} from "rlayers/style";
import {useState} from "react";

export default function CreateCourse(props: any) {
    const [isSetDefaultLocation, setDefaultLocation] = useState(false);
    const { drawnCourse, setDrawnCourse,isOpen, onClose, setDrawState, getCourses } = props;

    const onOpenChange = async function (isOpen: boolean) {
        if (isOpen) {

        } else {
            onClose();
            setDefaultLocation(false);
            getCourses();
            setDrawState(false);
            setDrawnCourse(null)
        }
    };

    const handleSubmit = async function (e : any) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const entries = Object.fromEntries(formData.entries());

        entries.flatCoordinates = JSON.stringify(drawnCourse.flatCoordinates)

        if (confirm('코스를 저장하시겠습니까?')) {
            await fetch('/api/courses', {
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

    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false}>
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
                                        <Input type="hidden" label="코스좌표" name={"flatCoordinates"} value={(drawnCourse.flatCoordinates).toString()} readOnly={true}/>
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
                                                          e.target.getView().fit(drawnCourse.extent, {
                                                              padding: [30, 20, 20, 20]
                                                          })
                                                      }
                                                  }
                                              }
                                        >
                                            <ROSM/>
                                            <RLayerVector zIndex={10}>
                                                <RFeature geometry={new LineString(drawnCourse.flatCoordinates)}>
                                                    <RStyle zIndex={1}>
                                                        <RStroke color="#f96d00" width={3}/>
                                                    </RStyle>
                                                </RFeature>
                                                <RFeature geometry={new LineString(drawnCourse.flatCoordinates)}>
                                                    <RStyle zIndex={0}>
                                                        <RStroke color="#f2f2f2" width={8}/>
                                                    </RStyle>
                                                </RFeature>
                                                <RFeature geometry={new Point(drawnCourse.flatCoordinates[0])}>
                                                    <RStyle zIndex={3}>
                                                        <RText text={'시작'} font={'bold 12px consolas'} offsetY={-5}>
                                                            <RStroke color={'white'} width={2}/>
                                                        </RText>
                                                    </RStyle>
                                                </RFeature>
                                                <RFeature
                                                    geometry={new Point(drawnCourse.flatCoordinates[drawnCourse.flatCoordinates.length - 1])}>
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