"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { RFeature, RLayerVector, RMap, ROSM } from "rlayers";
import { fromLonLat } from "ol/proj";
import { LineString, Point } from "ol/geom";
import { RStroke, RStyle, RText } from "rlayers/style";
import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { useRequireAuth } from "@/components/auth/use-require-auth";

export type DrawnCourseState = {
  date: string;
  description: string;
  extent: number[];
  id: number;
  name: string;
  address: string;
  /** OpenLayers LineString `getCoordinates()` (좌표 배열) */
  flatCoordinates: number[][];
};

export default function CreateCourse(props: {
  drawnCourse: DrawnCourseState;
  setDrawnCourse: Dispatch<SetStateAction<DrawnCourseState>>;
  isOpen: boolean;
  onClose: () => void;
  setDrawState: Dispatch<SetStateAction<boolean>>;
  /** 코스 등록 직후 지도/트렌드 SWR 갱신 */
  onSaved?: () => void;
}) {
  const [isSetDefaultLocation, setDefaultLocation] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { drawnCourse, setDrawnCourse, isOpen, onClose, setDrawState, onSaved } = props;
  const { requireAuth } = useRequireAuth();
  const coords = Array.isArray(drawnCourse?.flatCoordinates) ? drawnCourse.flatCoordinates : [];
  const hasCoords = coords.length > 1; // 둘 이상 꼭짓점

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
  };

  const runSave = async () => {
    if (!hasCoords) {
      toast.error("지도에 경로를 먼저 그려주세요.");
      return;
    }
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const entries = Object.fromEntries(formData.entries()) as Record<string, string>;
    entries.flatCoordinates = JSON.stringify(drawnCourse.flatCoordinates);

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        body: JSON.stringify(entries),
      });
      const json = await res.json();
      if (json.status === 200) {
        toast.success("코스가 정상적으로 등록되었습니다.");
        onSaved?.();
        setDrawState(false);
        onClose();
        return;
      }
      if (json.status === 401) {
        toast.error("로그인 정보가 없습니다.");
        requireAuth({ type: "createCourse" });
        return;
      }
      toast.error("데이터 처리 중 오류가 발생했습니다.");
    } catch {
      toast.error("데이터 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[min(88dvh,640px)] overflow-y-auto">
          <DialogHeader className="shrink-0 text-left sm:text-left">
            <DialogTitle>코스 저장</DialogTitle>
          </DialogHeader>
          <form
            ref={formRef}
            method="post"
            onSubmit={(e) => {
              e.preventDefault();
              void runSave();
            }}
            className="flex flex-col gap-4"
          >
            <FieldSet>
              <FieldLegend className="sr-only">이름, 설명</FieldLegend>
              <FieldGroup className="gap-3">
                <Field>
                  <FieldLabel htmlFor="course-name">이름</FieldLabel>
                  <Input id="course-name" required type="text" name="name" autoComplete="off" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="course-desc">설명</FieldLabel>
                  <Textarea id="course-desc" required name="description" rows={2} className="min-h-0 resize-none" />
                </Field>
              </FieldGroup>
            </FieldSet>
            <input type="hidden" name="flatCoordinates" value={String(coords)} readOnly />

            <div className="h-56 w-full overflow-hidden rounded-lg border bg-muted">
              {hasCoords ? (
                <RMap
                  className="h-full w-full"
                  initial={{ center: fromLonLat([2.364, 48.82]), zoom: 11 }}
                  onPostRender={(e) => {
                    if (isSetDefaultLocation) {
                      return;
                    }
                    setDefaultLocation(true);
                    e.target.getView().fit(drawnCourse.extent, {
                      padding: [30, 20, 20, 20],
                    });
                  }}
                >
                  <ROSM />
                  <RLayerVector zIndex={10}>
                    <RFeature geometry={new LineString(coords)}>
                      <RStyle zIndex={1}>
                        <RStroke color="rgba(96,165,250,0.95)" width={3} />
                      </RStyle>
                    </RFeature>
                    <RFeature geometry={new LineString(coords)}>
                      <RStyle zIndex={0}>
                        <RStroke color="rgba(15,23,42,0.82)" width={8} />
                      </RStyle>
                    </RFeature>
                    <RFeature geometry={new Point(coords[0])}>
                      <RStyle zIndex={3}>
                        <RText text={"시작"} font={"bold 12px consolas"} offsetY={-5}>
                          <RStroke color={"white"} width={2} />
                        </RText>
                      </RStyle>
                    </RFeature>
                    <RFeature geometry={new Point(coords[coords.length - 1])}>
                      <RStyle zIndex={3}>
                        <RStroke color={"white"} width={1} />
                        <RText text={"끝"} font={"bold 12px consolas"} offsetY={-10}>
                          <RStroke color={"white"} width={2} />
                        </RText>
                      </RStyle>
                    </RFeature>
                  </RLayerVector>
                </RMap>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  경로 없음
                </div>
              )}
            </div>
            <div className="flex w-full justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                닫기
              </Button>
              <Button type="submit">저장</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
