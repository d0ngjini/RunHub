import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RFeature, RLayerVector, RMap, ROSM } from "rlayers";
import { fromLonLat } from "ol/proj";
import { LineString, Point } from "ol/geom";
import { RStroke, RStyle, RText } from "rlayers/style";
import { useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

export default function CreateCourse(props: any) {
    const [isSetDefaultLocation, setDefaultLocation] = useState(false);
    const { drawnCourse, setDrawnCourse, isOpen, onClose, setDrawState } = props;
    const coords = Array.isArray(drawnCourse?.flatCoordinates) ? drawnCourse.flatCoordinates : [];
    const hasCoords = coords.length > 1;

    const onOpenChange = (nextOpen: boolean) => {
        if (nextOpen) return;
        onClose();
        setDefaultLocation(false);
        setDrawState(false);
        setDrawnCourse({
          date: "",
          description: "",
          extent: [],
          id: -1,
          name: "",
          address: "",
          flatCoordinates: [],
        });
    }

    const handleSubmit = async function (e: any) {
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
                        toast.success('코스가 정상적으로 등록되었습니다.');
                    } else if (json.status === 401) {
                        toast.error('로그인 정보가 없습니다.');
                        authClient.signIn.social({ provider: "kakao" })
                    } else {
                        toast.error('데이터 처리 중 오류가 발생했습니다.');
                    }

                    setDrawState(false);
                    onClose();
                });
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>그려진 경로를 저장합니다.</DialogTitle>
                    </DialogHeader>
                    <form method="post" onSubmit={handleSubmit} className="space-y-3">
                        <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                            <Input required type="text" name="name" placeholder="코스명" />
                        </div>
                        <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                            <Textarea required name="description" placeholder="설명" rows={2} />
                        </div>
                        <input type="hidden" name="flatCoordinates" value={coords.toString()} readOnly />

                        <div className="w-full h-48">
                            {hasCoords ? (
                              <RMap className='w-full h-full'
                                  initial={{ center: fromLonLat([2.364, 48.82]), zoom: 11 }}
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
                                  <ROSM />
                                  <RLayerVector zIndex={10}>
                                      <RFeature geometry={new LineString(coords)}>
                                          <RStyle zIndex={1}>
                                              <RStroke color="#f96d00" width={3} />
                                          </RStyle>
                                      </RFeature>
                                      <RFeature geometry={new LineString(coords)}>
                                          <RStyle zIndex={0}>
                                              <RStroke color="#f2f2f2" width={8} />
                                          </RStyle>
                                      </RFeature>
                                      <RFeature geometry={new Point(coords[0])}>
                                          <RStyle zIndex={3}>
                                              <RText text={'시작'} font={'bold 12px consolas'} offsetY={-5}>
                                                  <RStroke color={'white'} width={2} />
                                              </RText>
                                          </RStyle>
                                      </RFeature>
                                      <RFeature geometry={new Point(coords[coords.length - 1])}>
                                          <RStyle zIndex={3}>
                                              <RStroke color={'white'} width={1} />
                                              <RText text={'끝'} font={'bold 12px consolas'} offsetY={-10}>
                                                  <RStroke color={'white'} width={2} />
                                              </RText>
                                          </RStyle>
                                      </RFeature>
                                  </RLayerVector>
                              </RMap>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center rounded-md border border-border bg-muted/30 text-sm text-default-500">
                                미리보기 준비 중입니다. 지도에서 경로를 그려주세요.
                              </div>
                            )}
                        </div>
                        <div className="w-full flex justify-end gap-2 pt-1">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                취소
                            </Button>
                            <Button type="submit">
                                저장
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}