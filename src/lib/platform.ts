// 홈 화면 추가 안내용 기기·브라우저 판별 — 순수 함수.
// User-Agent 기반이라 100% 정확하지 않다. 애매하면 안내를 더 많이 보여 주는 쪽으로 판별한다.
import type { Source } from "./source";

export type InstallContext =
  | "standalone" // 이미 홈 화면 앱으로 열림 → 안내 없음
  | "ios-safari"
  | "ios-other" // 아이폰 크롬·네이버 앱 등 → 사파리로 열도록 안내
  | "android-chrome"
  | "android-other" // 삼성 인터넷 등
  | "instagram" // 인스타 앱 안 브라우저
  | "kakao" // 카톡 앱 안 브라우저
  | "inapp" // 그 밖의 앱 안 브라우저 (페이스북·라인·네이버 앱 등)
  | "desktop"; // PC → 안내 없음

export interface PlatformInput {
  userAgent: string;
  /** display-mode: standalone 이거나 navigator.standalone */
  standalone: boolean;
  /** 아이패드(데스크톱 모드)가 맥으로 보이는 경우 구분용 */
  maxTouchPoints: number;
}

export function isIos(input: Pick<PlatformInput, "userAgent" | "maxTouchPoints">): boolean {
  return /iPhone|iPad|iPod/.test(input.userAgent) || (/Macintosh/.test(input.userAgent) && input.maxTouchPoints > 1);
}

export function detectInstallContext(input: PlatformInput): InstallContext {
  const ua = input.userAgent;
  if (input.standalone) return "standalone";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/KAKAOTALK/i.test(ua)) return "kakao";
  if (/FBAN|FBAV|FB_IAB|\bLine\/|NAVER\(inapp|DaumApps|Twitter/i.test(ua)) return "inapp";

  if (isIos(input)) {
    // 아이폰 크롬(CriOS)·파이어폭스(FxiOS)·엣지(EdgiOS) 등은 사파리가 아님
    return /CriOS|FxiOS|EdgiOS|OPiOS|Whale|NAVER/.test(ua) ? "ios-other" : "ios-safari";
  }
  if (/Android/.test(ua)) {
    // "; wv)" = 앱 안 웹뷰
    if (/; wv\)/.test(ua)) return "inapp";
    return /Chrome\//.test(ua) && !/SamsungBrowser|Whale|NAVER|EdgA|OPR|Firefox/.test(ua) ? "android-chrome" : "android-other";
  }
  return "desktop";
}

/** 아이폰은 홈 화면 앱과 사파리가 저장 공간을 따로 써서, 입력 "전에" 추가하라고 안내해야 하는 경우 */
export function shouldGuideBeforeSetup(context: InstallContext): boolean {
  return context === "ios-safari" || context === "ios-other" || context === "instagram" || context === "kakao" || context === "inapp";
}

/** 안내 카드를 보여 줄지 (이미 앱이거나 PC면 안 보임) */
export function canShowInstallGuide(context: InstallContext): boolean {
  return context !== "standalone" && context !== "desktop";
}

/** 유튜브 앱 안 화면은 User-Agent가 사파리·크롬과 같아 구분이 안 됨 → ?from=youtube 면 "유튜브에서 왔다면" 단계를 덧붙임 */
export function needsYoutubeHint(context: InstallContext, source: Source | null): boolean {
  return source === "youtube" && (context === "ios-safari" || context === "android-chrome");
}
