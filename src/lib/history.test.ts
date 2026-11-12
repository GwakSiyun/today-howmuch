import { describe, expect, it } from "vitest";
import { compareLastTwo, recentHistory } from "./history";
import { prevPayday, toDateKey } from "./payday";
import type { Settings } from "./storage";

const settings: Settings = { payDay: 25, earlyOnDayOff: false, useFixedExpenses: false, fixedExpenses: [] };

describe("prevPayday — 진행 막대 시작점", () => {
  it("11/12 → 직전 지급일 10/25", () => {
    expect(toDateKey(prevPayday(new Date(2026, 10, 12), { payDay: 25, earlyOnDayOff: false }))).toBe("2026-10-25");
  });

  it("오늘이 지급일이면 오늘", () => {
    expect(toDateKey(prevPayday(new Date(2026, 10, 25), { payDay: 25, earlyOnDayOff: false }))).toBe("2026-11-25");
  });

  it("휴일 옵션: 10/25(일) → 10/23(금)이 직전 지급일", () => {
    expect(toDateKey(prevPayday(new Date(2026, 10, 12), { payDay: 25, earlyOnDayOff: true }))).toBe("2026-10-23");
  });

  it("1일 지급이 전달로 당겨진 날(10/30)이 오늘이면 오늘", () => {
    expect(toDateKey(prevPayday(new Date(2026, 9, 30), { payDay: 1, earlyOnDayOff: true }))).toBe("2026-10-30");
  });
});

describe("지난번보다", () => {
  it("입력 1번뿐이면 비교 없음", () => {
    expect(compareLastTwo([{ date: "2026-11-12", balance: 100_000 }], settings)).toBeNull();
  });

  it("각 입력 날짜 기준 하루 금액끼리 비교", () => {
    // 11/9: 300,000 ÷ 16일 = 18,750 / 11/12: 250,000 ÷ 13일 = 19,230
    const result = compareLastTwo(
      [
        { date: "2026-11-09", balance: 300_000 },
        { date: "2026-11-12", balance: 250_000 },
      ],
      settings,
    );
    expect(result).toEqual({ diff: 480, daysBetween: 3 });
  });

  it("막대는 최근 5개 입력만, 입력한 날만", () => {
    const balances = ["01", "03", "05", "07", "09", "12"].map((d) => ({ date: `2026-11-${d}`, balance: 100_000 }));
    expect(recentHistory(balances, settings).map((p) => p.date)).toEqual([
      "2026-11-03",
      "2026-11-05",
      "2026-11-07",
      "2026-11-09",
      "2026-11-12",
    ]);
  });
});
