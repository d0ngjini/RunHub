"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Camera, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";

import { authClient } from "@/lib/auth-client";
import { useExplorePanels } from "@/components/app/explore-panels-context";
import { useAuthUi } from "@/components/auth/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
type MeJson = {
  id: string;
  name: string;
  email: string | null;
  image: string | null;
  bio: string | null;
};

const meFetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error("me");
  return r.json() as Promise<MeJson>;
});

function initialsFromName(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase();
  return (p[0]![0]! + p[p.length - 1]![0]!).toUpperCase();
}

const MAX_FILE_BYTES = 1_200_000;

export function MePanel() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { openAuth } = useAuthUi();
  const { meTab, setMeTab, closePanel } = useExplorePanels();

  const { data: me, isLoading: meLoading, mutate: mutateMe } = useSWR<MeJson>(
    session?.user ? "/api/me" : null,
    meFetcher,
    { revalidateOnFocus: true }
  );

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [imageFileUrl, setImageFileUrl] = useState<string | null>(null);
  const [imageShouldClear, setImageShouldClear] = useState(false);
  const [saving, setSaving] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (!me) return;
    setName(me.name);
    setBio(me.bio ?? "");
    setImageFileUrl(null);
    setImageShouldClear(false);
  }, [me?.id, me?.name, me?.bio, me?.image, me?.email]);

  const displayImage = useMemo(() => {
    if (imageShouldClear) return null;
    if (imageFileUrl) return imageFileUrl;
    return me?.image ?? session?.user?.image ?? null;
  }, [imageFileUrl, imageShouldClear, me?.image, session?.user?.image]);

  const onPickFile = useCallback((file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 올릴 수 있습니다.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("이미지는 1.2MB 이하로 올려 주세요.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const s = String(reader.result ?? "");
      if (s.length > 450_000) {
        toast.error("이미지가 너무 큽니다. 더 작은 파일을 사용해 주세요.");
        return;
      }
      setImageFileUrl(s);
      setImageShouldClear(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const onSave = async () => {
    if (!session?.user) return;
    setSaving(true);
    try {
      const body: { name: string; bio: string; image?: string | null } = {
        name: name.trim() || (me?.name ?? "러너"),
        bio: bio.trim(),
      };
      if (imageShouldClear) body.image = null;
      else if (imageFileUrl) body.image = imageFileUrl;

      const r = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.status === 401) {
        toast.error("다시 로그인해 주세요.");
        return;
      }
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        toast.error(j.error === "image_too_large" ? "이미지가 너무 큽니다." : "저장에 실패했습니다.");
        return;
      }
      void mutateMe();
      setImageFileUrl(null);
      setImageShouldClear(false);
      toast.success("저장했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const onWithdraw = async () => {
    setWithdrawing(true);
    try {
      const r = await fetch("/api/me/withdraw", { method: "POST" });
      if (!r.ok) {
        toast.error("탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      setWithdrawOpen(false);
      closePanel();
      await authClient.signOut();
      toast.success("회원에서 탈퇴했습니다.");
    } finally {
      setWithdrawing(false);
    }
  };

  if (sessionPending) {
    return (
      <div className="flex max-h-[min(70dvh,560px)] flex-col gap-4 overflow-y-auto pr-0.5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-20 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex max-h-[min(70dvh,560px)] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          로그인하면 프로필을 편집할 수 있습니다.
        </div>
        <Button type="button" size="sm" onClick={() => openAuth({ type: "generic" })}>
          로그인
        </Button>
      </div>
    );
  }

  const meReady = me && !meLoading;
  const label = (me?.name || session.user.name || "U").toString();
  const dirty =
    (me && (name !== (me.name ?? "") || (bio || "") !== (me.bio ?? ""))) ||
    imageFileUrl !== null ||
    imageShouldClear;

  return (
    <div className="flex max-h-[min(70dvh,560px)] flex-col gap-0 overflow-y-auto pr-0.5">
      {!meReady ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-20 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <Tabs
          value={meTab}
          onValueChange={(v) => setMeTab(v as "profile" | "account")}
          className="flex w-full flex-col gap-4"
        >
          <TabsList className="grid w-full grid-cols-2" variant="line">
            <TabsTrigger value="profile">프로필</TabsTrigger>
            <TabsTrigger value="account">계정</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-0 flex min-h-0 flex-col gap-5">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <div className="relative">
                <Avatar className="!size-20">
                  <AvatarImage
                    src={displayImage ?? undefined}
                    alt=""
                    className="object-cover"
                  />
                  <AvatarFallback className="text-base font-medium">{initialsFromName(label)}</AvatarFallback>
                </Avatar>
                <label className="absolute -right-0.5 -bottom-0.5 flex size-8 cursor-pointer items-center justify-center rounded-full border border-border bg-background shadow-sm transition-colors hover:bg-muted">
                  <Camera className="size-3.5" aria-hidden />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="sr-only"
                    onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                  />
                  <span className="sr-only">프로필 사진 변경</span>
                </label>
              </div>
              <div className="flex w-full min-w-0 flex-1 flex-col gap-2 sm:pt-0.5">
                <div className="space-y-1.5">
                  <Label htmlFor="me-name">표시 이름</Label>
                  <Input
                    id="me-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={64}
                    autoComplete="name"
                    placeholder="닉네임"
                  />
                </div>
                {me?.email ? (
                  <p className="text-xs text-muted-foreground">
                    <span className="text-foreground/80">이메일</span> {me.email} (로그인 계정·변경 불가)
                  </p>
                ) : null}
                <div className="space-y-1.5">
                  <Label htmlFor="me-bio">내 소개</Label>
                  <Textarea
                    id="me-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="간단한 소개를 적어 주세요."
                    className="min-h-24 resize-y"
                  />
                  <p className="text-xs text-muted-foreground tabular-nums">{bio.length} / 500</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button type="button" size="sm" onClick={onSave} disabled={saving || !dirty}>
                    {saving ? "저장 중…" : "저장"}
                  </Button>
                  {(me?.image || imageFileUrl) && !imageShouldClear ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => {
                        setImageFileUrl(null);
                        setImageShouldClear(true);
                      }}
                    >
                      사진 제거
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="account" className="mt-0 flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">로그아웃하거나 이 서비스에서 계정을 삭제할 수 있습니다.</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 sm:w-auto"
                onClick={() => {
                  void authClient.signOut();
                  closePanel();
                }}
              >
                <LogOut className="size-4" aria-hidden />
                로그아웃
              </Button>
            </div>
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm text-foreground">회원 탈퇴</p>
              <p className="mt-1 text-xs text-muted-foreground">
                등록한 코스·저장·알림 등 본인 데이터가 삭제됩니다. 되돌릴 수 없습니다.
              </p>
              <Button
                type="button"
                variant="destructive"
                className="mt-3 w-full sm:w-auto"
                onClick={() => setWithdrawOpen(true)}
              >
                회원 탈퇴
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>정말 탈퇴할까요?</DialogTitle>
            <DialogDescription>
              계정과 연결된 데이터가 삭제되며 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setWithdrawOpen(false)} disabled={withdrawing}>
              취소
            </Button>
            <Button type="button" variant="destructive" onClick={() => void onWithdraw()} disabled={withdrawing}>
              {withdrawing ? "처리 중…" : "탈퇴하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
