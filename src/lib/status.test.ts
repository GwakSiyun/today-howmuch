import { describe, expect, it } from "vitest";
import { getBudgetStatus } from "./status";

describe("getBudgetStatus — 2만 이상 여유 · 1만~2만 빠듯 · 1만 미만 위험", () => {
  it("경계값: 20,000원은 여유, 19,999원은 빠듯", () => {
    expect(getBudgetStatus(20_000)).toBe("relaxed");
    expect(getBudgetStatus(19_999)).toBe("tight");
  });

  it("경계값: 10,000원은 빠듯, 9,999원은 위험", () => {
    expect(getBudgetStatus(10_000)).toBe("tight");
    expect(getBudgetStatus(9_999)).toBe("danger");
  });

  it("0원·마이너스는 위험", () => {
    expect(getBudgetStatus(0)).toBe("danger");
    expect(getBudgetStatus(-2_000)).toBe("danger");
  });

  it("기준을 바꿔 넣을 수 있다", () => {
    expect(getBudgetStatus(15_000, { relaxedMin: 15_000, tightMin: 7_000 })).toBe("relaxed");
  });
});
