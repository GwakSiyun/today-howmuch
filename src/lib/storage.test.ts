import { describe, expect, it } from "vitest";
import { parseAppData, upsertBalance, type AppData } from "./storage";

describe("upsertBalance — 같은 날은 덮어쓰기", () => {
  it("새 날짜면 뒤에 추가", () => {
    const result = upsertBalance([{ date: "2026-11-10", balance: 300_000 }], {
      date: "2026-11-12",
      balance: 250_000,
    });
    expect(result).toEqual([
      { date: "2026-11-10", balance: 300_000 },
      { date: "2026-11-12", balance: 250_000 },
    ]);
  });

  it("같은 날 다시 입력하면 그날 값만 바뀐다 (1건 유지)", () => {
    const result = upsertBalance(
      [
        { date: "2026-11-10", balance: 300_000 },
        { date: "2026-11-12", balance: 250_000 },
      ],
      { date: "2026-11-12", balance: 240_000 },
    );
    expect(result).toEqual([
      { date: "2026-11-10", balance: 300_000 },
      { date: "2026-11-12", balance: 240_000 },
    ]);
  });

  it("원본 배열은 바꾸지 않는다", () => {
    const original = [{ date: "2026-11-12", balance: 1 }];
    upsertBalance(original, { date: "2026-11-12", balance: 2 });
    expect(original[0].balance).toBe(1);
  });
});

describe("parseAppData — 비었거나 깨지면 null (= 첫 설정 화면)", () => {
  const valid: AppData = {
    version: 1,
    settings: {
      payDay: 25,
      earlyOnDayOff: true,
      useFixedExpenses: true,
      fixedExpenses: [{ id: "a", name: "월세", amount: 400_000, paidFor: null }],
    },
    balances: [{ date: "2026-11-12", balance: 300_000 }],
  };

  it("정상 데이터는 그대로", () => {
    expect(parseAppData(JSON.stringify(valid))).toEqual(valid);
  });

  it("없음 / 깨진 JSON / 잔액 0건", () => {
    expect(parseAppData(null)).toBeNull();
    expect(parseAppData("{oops")).toBeNull();
    expect(parseAppData(JSON.stringify({ ...valid, balances: [] }))).toBeNull();
  });

  it("월급날이 범위 밖이면 null", () => {
    const broken = { ...valid, settings: { ...valid.settings, payDay: 40 } };
    expect(parseAppData(JSON.stringify(broken))).toBeNull();
  });
});
