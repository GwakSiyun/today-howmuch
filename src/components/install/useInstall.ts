// 홈 화면 추가 안내용 브라우저 상태 (client 전용)
import { useSyncExternalStore } from "react";
import { detectInstallContext, isIos, type InstallContext } from "@/lib/platform";
import { sourceFromUrl, type Source } from "@/lib/source";

export interface InstallEnv {
  context: InstallContext;
  ios: boolean;
  source: Source | null;
}

// ── 기기 정보: 한 번 읽으면 바뀌지 않음 ──
let cachedEnv: InstallEnv | null = null;

function readEnv(): InstallEnv {
  if (cachedEnv) return cachedEnv;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  let standalone = nav.standalone === true;
  try {
    standalone = standalone || window.matchMedia("(display-mode: standalone)").matches;
  } catch {
    // matchMedia 없으면 navigator.standalone 만
  }
  const input = { userAgent: nav.userAgent, standalone, maxTouchPoints: nav.maxTouchPoints ?? 0 };
  cachedEnv = { context: detectInstallContext(input), ios: isIos(input), source: sourceFromUrl(window.location.href) };
  return cachedEnv;
}

function subscribeNothing(): () => void {
  return () => {};
}

/** 서버 렌더·하이드레이션 중에는 null */
export function useInstallEnv(): InstallEnv | null {
  return useSyncExternalStore<InstallEnv | null>(subscribeNothing, readEnv, () => null);
}

// ── 안드로이드 크롬 설치 창 (beforeinstallprompt) ──
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    // 크롬 기본 미니 배너 대신 안내 시트의 버튼으로 띄움
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    promptListeners.forEach((listener) => listener());
  });
}

function subscribePrompt(listener: () => void): () => void {
  promptListeners.add(listener);
  return () => promptListeners.delete(listener);
}

/** 크롬이 설치 창을 띄울 수 있으면 true */
export function useCanPromptInstall(): boolean {
  return useSyncExternalStore(subscribePrompt, () => deferredPrompt !== null, () => false);
}

/** 설치 창 띄우기. 띄울 수 없으면 false */
export async function promptInstall(): Promise<boolean> {
  const event = deferredPrompt;
  if (!event) return false;
  deferredPrompt = null; // 한 번 쓰면 다시 못 씀
  promptListeners.forEach((listener) => listener());
  try {
    await event.prompt();
    return (await event.userChoice).outcome === "accepted";
  } catch {
    return false;
  }
}

// ── [닫기] 기억 (기기별 편의 기능이라 localStorage, 실패해도 다시 보일 뿐) ──
const DISMISS_KEY = "today-howmuch:install-guide";
export type GuideVariant = "setup" | "main";

export function readDismissed(variant: GuideVariant): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const value: unknown = JSON.parse(raw);
    return typeof value === "object" && value !== null && (value as Record<string, unknown>)[variant] === true;
  } catch {
    return false;
  }
}

export function writeDismissed(variant: GuideVariant): void {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    const prev: unknown = raw ? JSON.parse(raw) : {};
    const base = typeof prev === "object" && prev !== null ? (prev as Record<string, unknown>) : {};
    window.localStorage.setItem(DISMISS_KEY, JSON.stringify({ ...base, [variant]: true }));
  } catch {
    // 저장 못 해도 이번 화면에서는 닫힘
  }
}
