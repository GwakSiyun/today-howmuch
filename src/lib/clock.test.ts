import { describe, expect, it } from "vitest";
import { msUntilNextMidnight } from "./clock";

describe("msUntilNextMidnight", () => {
  it("23:59:00 → 1분 + 여유 1초", () => {
    expect(msUntilNextMidnight(new Date(2026, 10, 16, 23, 59, 0))).toBe(61_000);
  });

  it("자정 정각 → 하루 + 1초", () => {
    expect(msUntilNextMidnight(new Date(2026, 10, 17, 0, 0, 0))).toBe(86_401_000);
  });

  it("월말·연말도 다음 날 자정으로", () => {
    expect(msUntilNextMidnight(new Date(2026, 11, 31, 23, 0, 0))).toBe(3_601_000);
  });
});
