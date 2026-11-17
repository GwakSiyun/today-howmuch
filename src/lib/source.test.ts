import { describe, expect, it } from "vitest";
import { analyticsUrl, sourceFromUrl } from "./source";

const base = "https://today-howmuch.vercel.app";

describe("유입 경로 → 가상 경로", () => {
  it("인스타·유튜브는 /from/출처 로", () => {
    expect(analyticsUrl(`${base}/?from=instagram`)).toBe(`${base}/from/instagram`);
    expect(analyticsUrl(`${base}/?from=youtube`)).toBe(`${base}/from/youtube`);
  });

  it("대소문자·공백은 정리", () => {
    expect(sourceFromUrl(`${base}/?from=Instagram%20`)).toBe("instagram");
  });

  it("출처 없음·모르는 값은 주소 그대로 (아무 값이나 기록하지 않음)", () => {
    expect(analyticsUrl(`${base}/`)).toBe(`${base}/`);
    expect(analyticsUrl(`${base}/?from=tiktok`)).toBe(`${base}/?from=tiktok`);
  });

  it("# 뒤(옮기는 값)는 분석 기록에서 항상 뺌", () => {
    expect(analyticsUrl(`${base}/#import=abc`)).toBe(`${base}/`);
    expect(analyticsUrl(`${base}/?from=instagram#import=abc`)).toBe(`${base}/from/instagram`);
  });

  it("깨진 주소는 출처 없음", () => {
    expect(sourceFromUrl("not a url")).toBeNull();
  });
});
