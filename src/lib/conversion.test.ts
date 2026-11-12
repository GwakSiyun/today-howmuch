import { describe, expect, it } from "vitest";
import { convertDaily, countAffordable } from "./conversion";

describe("환산 — 아아 1,500 · 삼각김밥 1,400 · 컵라면 1,200", () => {
  it("20,400원 → 아아 13 · 삼각김밥 14 · 컵라면 17 (내림)", () => {
    expect(convertDaily(20_400)).toEqual([
      { label: "아아", count: 13 },
      { label: "삼각김밥", count: 14 },
      { label: "컵라면", count: 17 },
    ]);
  });

  it("딱 맞으면 그 개수, 1원 모자라면 하나 적게", () => {
    expect(countAffordable(3_000, 1_500)).toBe(2);
    expect(countAffordable(2_999, 1_500)).toBe(1);
  });

  it("0원·마이너스는 0개 (음수 개수 없음)", () => {
    expect(countAffordable(0, 1_500)).toBe(0);
    expect(countAffordable(-2_000, 1_500)).toBe(0);
  });
});
