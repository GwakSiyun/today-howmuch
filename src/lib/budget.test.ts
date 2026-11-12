import { describe, expect, it } from "vitest";
import { calcDailyBudget, togglePaid, type FixedExpense } from "./budget";

const rule = { payDay: 25, earlyOnDayOff: false };
const today = new Date(2026, 10, 12); // 11/12 → 11/25, 13일

function fx(id: string, amount: number, paidFor: string | null = null): FixedExpense {
  return { id, name: id, amount, paidFor };
}

describe("calcDailyBudget", () => {
  it("잔액 ÷ 남은 날수, 원 단위 내림", () => {
    const result = calcDailyBudget({ balance: 300_000, fixedExpenses: [], today, rule });
    expect(result.daysLeft).toBe(13);
    expect(result.daily).toBe(23_076); // 300000 / 13 = 23076.9…
  });

  it("아직 안 나간 고정 지출을 먼저 뺀다", () => {
    const result = calcDailyBudget({
      balance: 300_000,
      fixedExpenses: [fx("월세", 40_000), fx("통신비", 10_000)],
      today,
      rule,
    });
    expect(result.fixedTotal).toBe(50_000);
    expect(result.spendable).toBe(250_000);
    expect(result.daily).toBe(19_230);
  });

  it("지급일 전날이면 남은 돈 전부", () => {
    const result = calcDailyBudget({
      balance: 12_345,
      fixedExpenses: [],
      today: new Date(2026, 10, 24),
      rule,
    });
    expect(result.daysLeft).toBe(1);
    expect(result.daily).toBe(12_345);
  });

  it("고정 지출이 잔액보다 크면 음수 그대로 (0으로 숨기지 않음)", () => {
    const result = calcDailyBudget({
      balance: 30_000,
      fixedExpenses: [fx("월세", 56_000)],
      today,
      rule,
    });
    expect(result.spendable).toBe(-26_000);
    expect(result.daily).toBe(-2_000);
  });
});

describe("고정 지출 '나갔어요'", () => {
  it("이번 주기에 나간 항목은 빼지 않는다", () => {
    const result = calcDailyBudget({
      balance: 300_000,
      fixedExpenses: [fx("월세", 40_000, "2026-11-25"), fx("통신비", 10_000)],
      today,
      rule,
    });
    expect(result.cycleKey).toBe("2026-11-25");
    expect(result.fixedTotal).toBe(10_000);
  });

  it("월급날이 지나 주기가 바뀌면 다시 '아직 안 나감'", () => {
    const result = calcDailyBudget({
      balance: 300_000,
      fixedExpenses: [fx("월세", 40_000, "2026-11-25")],
      today: new Date(2026, 10, 26), // 다음 주기 12/25
      rule,
    });
    expect(result.fixedTotal).toBe(40_000);
  });

  it("딸깍 → 나감, 한 번 더 → 취소, 다른 항목은 그대로", () => {
    const items = [fx("월세", 40_000), fx("통신비", 10_000)];
    const once = togglePaid(items, "월세", "2026-11-25");
    expect(once[0].paidFor).toBe("2026-11-25");
    expect(once[1].paidFor).toBeNull();
    const twice = togglePaid(once, "월세", "2026-11-25");
    expect(twice[0].paidFor).toBeNull();
  });

  it("지난 주기에 눌렀던 항목을 누르면 이번 주기로 나감 처리", () => {
    const items = [fx("월세", 40_000, "2026-10-25")];
    expect(togglePaid(items, "월세", "2026-11-25")[0].paidFor).toBe("2026-11-25");
  });
});
