import { describe, expect, it } from "vitest";
import { detectFeedbackSource, toFeedbackSource } from "./feedbackSource";

const base = "https://today-howmuch.vercel.app/";

function detect(url: string, referrer = "", standalone = false): string {
  return detectFeedbackSource({ url, referrer, standalone });
}

describe("의견 들어온 경로", () => {
  it("?from= 링크가 가장 먼저", () => {
    expect(detect(`${base}?from=instagram`, "https://www.google.com/", true)).toBe("instagram");
  });

  it("홈 화면 앱이면 app", () => {
    expect(detect(base, "", true)).toBe("app");
  });

  it("referrer로 검색·SNS 판단", () => {
    expect(detect(base, "https://search.naver.com/search.naver?query=월급날")).toBe("naver");
    expect(detect(base, "https://www.google.com/")).toBe("google");
    expect(detect(base, "https://m.youtube.com/")).toBe("youtube");
    expect(detect(base, "https://l.instagram.com/")).toBe("instagram");
    expect(detect(base, "https://everytime.kr/")).toBe("other");
  });

  it("referrer 없음·같은 사이트면 direct", () => {
    expect(detect(base)).toBe("direct");
    expect(detect(base, `${base}dev/preview`)).toBe("direct");
  });

  it("서버에 온 값이 목록 밖이면 other", () => {
    expect(toFeedbackSource("app")).toBe("app");
    expect(toFeedbackSource("<script>")).toBe("other");
  });
});
