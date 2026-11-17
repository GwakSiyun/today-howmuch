"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseAppData, readRaw, subscribe } from "@/lib/storage";
import MainScreen from "./main/MainScreen";
import SetupForm from "./SetupForm";

/** 서버 렌더·하이드레이션 중에는 localStorage를 못 읽으므로 undefined(=아직 모름) */
function getServerSnapshot(): string | null | undefined {
  return undefined;
}

export default function HomeApp(): React.ReactNode {
  const raw = useSyncExternalStore<string | null | undefined>(subscribe, readRaw, getServerSnapshot);
  const data = useMemo(() => (raw === undefined ? undefined : parseAppData(raw)), [raw]);

  // 아직 기기 데이터를 확인 전 — 빈 화면이 깜빡이지 않게 자리만
  if (data === undefined) return <div aria-busy="true" className="min-h-[60vh]" />;

  // 비었거나 깨졌으면 첫 설정
  if (data === null) return <SetupForm />;

  return <MainScreen data={data} />;
}
