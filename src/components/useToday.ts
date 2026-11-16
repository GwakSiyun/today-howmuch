// 오늘 날짜가 바뀌면 화면을 다시 그리게 하는 훅 (client 전용)
// 홈 화면 앱은 닫아도 백그라운드에 남아 있다가 다음 날 그대로 다시 열리는 경우가 많아서,
// 앱으로 돌아올 때(visibilitychange·focus·pageshow)와 자정에 날짜를 다시 확인한다.
import { useSyncExternalStore } from "react";
import { msUntilNextMidnight } from "@/lib/clock";
import { toDateKey } from "@/lib/payday";

function subscribe(onChange: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const scheduleMidnight = (): void => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      onChange();
      scheduleMidnight();
    }, msUntilNextMidnight(new Date()));
  };
  const onWake = (): void => {
    if (document.visibilityState === "visible") {
      onChange();
      // 잠든 동안 타이머가 밀렸을 수 있어 다시 맞춤
      scheduleMidnight();
    }
  };

  scheduleMidnight();
  document.addEventListener("visibilitychange", onWake);
  window.addEventListener("focus", onWake);
  window.addEventListener("pageshow", onWake);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onWake);
    window.removeEventListener("focus", onWake);
    window.removeEventListener("pageshow", onWake);
  };
}

/**
 * 오늘 날짜 키(YYYY-MM-DD). 날짜가 바뀔 때만 다시 그려진다(같은 날엔 같은 문자열).
 * 서버 렌더 중에는 "" — 이 앱 화면은 기기 데이터를 읽은 뒤(클라이언트)에만 그려진다.
 */
export function useTodayKey(): string {
  return useSyncExternalStore(subscribe, () => toDateKey(new Date()), () => "");
}
