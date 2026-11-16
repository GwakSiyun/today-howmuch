import { describe, expect, it } from "vitest";
import { detectInstallContext, needsYoutubeHint, shouldGuideBeforeSetup } from "./platform";

const UA = {
  iosSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  iosChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/138.0.7204.119 Mobile/15E148 Safari/604.1",
  iosInstagram:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 389.0.0.29.88 (iPhone15,2; iOS 18_5; ko_KR; ko; scale=3.00; 1179x2556; 754522845)",
  iosKakao:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 25.6.1",
  ipadDesktopMode:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
  androidChrome:
    "Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36",
  androidSamsung:
    "Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0.0.0 Mobile Safari/537.36",
  androidInstagram:
    "Mozilla/5.0 (Linux; Android 14; SM-S918N Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.0.0 Mobile Safari/537.36 Instagram 389.0.0.42.81 Android",
  androidWebview:
    "Mozilla/5.0 (Linux; Android 14; SM-S918N Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.0.0 Mobile Safari/537.36",
  macChrome:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
};

function detect(userAgent: string, { standalone = false, maxTouchPoints = 5 } = {}): string {
  return detectInstallContext({ userAgent, standalone, maxTouchPoints });
}

describe("detectInstallContext", () => {
  it("홈 화면 앱으로 열었으면 무조건 standalone", () => {
    expect(detect(UA.iosSafari, { standalone: true })).toBe("standalone");
  });

  it("아이폰 사파리 / 아이폰 크롬", () => {
    expect(detect(UA.iosSafari)).toBe("ios-safari");
    expect(detect(UA.iosChrome)).toBe("ios-other");
  });

  it("인스타·카톡 앱 안은 아이폰·안드로이드 모두 앱 안으로", () => {
    expect(detect(UA.iosInstagram)).toBe("instagram");
    expect(detect(UA.androidInstagram)).toBe("instagram");
    expect(detect(UA.iosKakao)).toBe("kakao");
  });

  it("아이패드(데스크톱 모드)는 맥처럼 보여도 터치로 아이폰 계열", () => {
    expect(detect(UA.ipadDesktopMode, { maxTouchPoints: 5 })).toBe("ios-safari");
    expect(detect(UA.ipadDesktopMode, { maxTouchPoints: 0 })).toBe("desktop");
  });

  it("안드로이드 크롬 / 삼성 인터넷 / 이름 모를 앱 웹뷰", () => {
    expect(detect(UA.androidChrome)).toBe("android-chrome");
    expect(detect(UA.androidSamsung)).toBe("android-other");
    expect(detect(UA.androidWebview)).toBe("inapp");
  });

  it("PC는 안내 없음", () => {
    expect(detect(UA.macChrome, { maxTouchPoints: 0 })).toBe("desktop");
  });
});

describe("언제 어떤 안내를 붙일지", () => {
  it("아이폰·앱 안은 입력 전에 안내, 안드로이드 크롬은 아님", () => {
    expect(shouldGuideBeforeSetup("ios-safari")).toBe(true);
    expect(shouldGuideBeforeSetup("instagram")).toBe(true);
    expect(shouldGuideBeforeSetup("android-chrome")).toBe(false);
  });

  it("?from=youtube 로 사파리·크롬처럼 보이면 '유튜브에서 왔다면' 단계 추가", () => {
    expect(needsYoutubeHint("ios-safari", "youtube")).toBe(true);
    expect(needsYoutubeHint("android-chrome", "youtube")).toBe(true);
    expect(needsYoutubeHint("ios-safari", "instagram")).toBe(false);
    expect(needsYoutubeHint("ios-safari", null)).toBe(false);
  });
});
