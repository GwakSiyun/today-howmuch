import { describe, expect, it } from "vitest";
import { josa } from "./korean";

describe("josa — 아이폰(사파리) / 갤럭시(크롬) 문구", () => {
  it("으로/로: 받침 있으면 으로, 없거나 ㄹ이면 로", () => {
    expect(josa("사파리", "으로/로")).toBe("사파리로");
    expect(josa("크롬", "으로/로")).toBe("크롬으로");
    expect(josa("서울", "으로/로")).toBe("서울로");
  });

  it("이/가", () => {
    expect(josa("사파리", "이/가")).toBe("사파리가");
    expect(josa("크롬", "이/가")).toBe("크롬이");
  });

  it("을/를 · 은/는", () => {
    expect(josa("크롬", "을/를")).toBe("크롬을");
    expect(josa("사파리", "은/는")).toBe("사파리는");
  });

  it("한글이 아니면 받침 없는 쪽", () => {
    expect(josa("Chrome", "으로/로")).toBe("Chrome로");
  });
});
