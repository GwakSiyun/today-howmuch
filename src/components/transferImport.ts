// 홈 화면 앱 첫 실행 때 주소 # 의 값을 가져오기 (client 전용) — lib/transfer.ts 참고
// ⚠️ 시험 중: 아이폰이 '지금 주소(# 포함)'로 홈 화면 앱을 만드는지 실기기 확인 필요.
import { useSyncExternalStore } from "react";
import { parseAppData, readRaw, saveAppData } from "@/lib/storage";
import { decodeTransferHash, IMPORT_KEY, stripHash } from "@/lib/transfer";

let pending: boolean | null = null;
const listeners = new Set<() => void>();

function hasImportHash(): boolean {
  if (pending === null) {
    pending = new URLSearchParams(window.location.hash.replace(/^#/, "")).has(IMPORT_KEY);
  }
  return pending;
}

function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  try {
    return nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  } catch {
    return nav.standalone === true;
  }
}

/**
 * 주소 # 에 옮길 값이 있으면:
 * - 홈 화면 앱이고 이 앱에 아직 저장된 값이 없을 때만 저장 (이미 쓰던 값은 절대 덮어쓰지 않음)
 * - 어느 경우든 주소에서 # 부분은 지움
 */
export function consumeTransferHash(): void {
  if (!hasImportHash()) return;
  const imported = decodeTransferHash(window.location.hash);
  if (imported && isStandalone() && parseAppData(readRaw()) === null) {
    saveAppData(imported);
  }
  try {
    window.history.replaceState(window.history.state, "", stripHash(window.location.href));
  } catch {
    // 주소를 못 바꿔도 값은 이미 처리됨
  }
  pending = false;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** 가져올 값이 남아 있는 동안 true — 첫 설정 화면이 잠깐 깜빡이지 않게 자리만 보여 줌 */
export function usePendingImport(): boolean {
  return useSyncExternalStore(subscribe, hasImportHash, () => false);
}
