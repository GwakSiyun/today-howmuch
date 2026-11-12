import { describe, expect, it } from "vitest";
import { daysUntilPayday, nextPayday, resolvePayday, toDateKey, type PaydayRule } from "./payday";

/** 로컬 날짜 생성 (월은 1~12) */
function d(y: number, m: number, day: number): Date {
  return new Date(y, m - 1, day);
}

function next(today: Date, payDay: number, earlyOnDayOff = false): string {
  const rule: PaydayRule = { payDay, earlyOnDayOff };
  return toDateKey(nextPayday(today, rule));
}

describe("nextPayday — 기본", () => {
  it("이번 달 지급일 전이면 이번 달 (11/12 → 11/25)", () => {
    expect(next(d(2026, 11, 12), 25)).toBe("2026-11-25");
  });

  it("오늘이 지급일이면 다음 달 기준", () => {
    expect(next(d(2026, 11, 25), 25)).toBe("2026-12-25");
  });

  it("지급일이 지났으면 다음 달", () => {
    expect(next(d(2026, 11, 26), 25)).toBe("2026-12-25");
  });

  it("12월 → 다음 해 1월로 넘어감", () => {
    expect(next(d(2026, 12, 28), 25)).toBe("2027-01-25");
  });

  it("시각이 있어도 날짜만 비교 (지급일 밤 23:59도 다음 달)", () => {
    expect(next(new Date(2026, 10, 25, 23, 59), 25)).toBe("2026-12-25");
  });
});

describe("nextPayday — 없는 날은 말일로", () => {
  it("31일 지급 + 30일까지인 달 → 30일", () => {
    expect(next(d(2026, 11, 5), 31)).toBe("2026-11-30");
  });

  it("31일 지급 + 2월(평년) → 2/28", () => {
    expect(next(d(2027, 2, 10), 31)).toBe("2027-02-28");
  });

  it("30일 지급 + 2월(윤년) → 2/29", () => {
    expect(next(d(2028, 2, 10), 30)).toBe("2028-02-29");
  });

  it("말일로 당겨진 날이 오늘이면 다음 달 원래 날짜", () => {
    expect(next(d(2026, 11, 30), 31)).toBe("2026-12-31");
  });
});

describe("nextPayday — 주말이면 직전 금요일", () => {
  it("일요일(10/25) → 금요일(10/23)", () => {
    expect(next(d(2026, 10, 20), 25, true)).toBe("2026-10-23");
  });

  it("토요일(7/25) → 금요일(7/24)", () => {
    expect(next(d(2026, 7, 10), 25, true)).toBe("2026-07-24");
  });

  it("옵션 꺼져 있으면 주말 그대로", () => {
    expect(next(d(2026, 10, 20), 25, false)).toBe("2026-10-25");
  });

  it("당겨진 금요일이 오늘이면 다음 달 기준", () => {
    expect(next(d(2026, 10, 23), 25, true)).toBe("2026-11-25");
  });

  it("당겨진 금요일은 지났고 원래 날(일)은 아직이어도 다음 달", () => {
    expect(next(d(2026, 10, 24), 25, true)).toBe("2026-11-25");
  });

  it("1일 지급이 일요일(11/1)이면 전달 금요일(10/30)", () => {
    expect(next(d(2026, 10, 29), 1, true)).toBe("2026-10-30");
  });

  it("전달로 당겨진 지급일(10/30)이 오늘이면 그다음 지급일(12/1)", () => {
    expect(next(d(2026, 10, 30), 1, true)).toBe("2026-12-01");
  });
});

describe("nextPayday — 공휴일이면 직전 평일 (천문연 데이터)", () => {
  it("추석(9/25 금·9/24 목) → 9/23 수", () => {
    expect(next(d(2026, 9, 10), 25, true)).toBe("2026-09-23");
  });

  it("옵션 꺼져 있으면 공휴일 그대로", () => {
    expect(next(d(2026, 9, 10), 25, false)).toBe("2026-09-25");
  });

  it("대체공휴일(10/5 월) → 일·토(개천절) 건너 10/2 금", () => {
    expect(next(d(2026, 9, 28), 5, true)).toBe("2026-10-02");
  });

  it("설 연휴+대체공휴일(2027-02-09 화) → 연휴 전 2/5 금", () => {
    expect(next(d(2027, 1, 26), 9, true)).toBe("2027-02-05");
  });

  it("크리스마스(12/25 금) → 12/24 목", () => {
    expect(next(d(2026, 12, 1), 25, true)).toBe("2026-12-24");
  });

  it("당겨진 날이 오늘이면 다음 달 기준 (12/24 → 2027-01-25)", () => {
    expect(next(d(2026, 12, 24), 25, true)).toBe("2027-01-25");
  });

  it("공휴일 표를 갈아끼울 수 있다 (표 밖 연도 = 주말만)", () => {
    const rule: PaydayRule = { payDay: 25, earlyOnDayOff: true };
    expect(toDateKey(nextPayday(d(2026, 9, 10), rule, () => false))).toBe("2026-09-25");
  });
});

describe("resolvePayday", () => {
  it("1~31 밖이면 에러", () => {
    expect(() => resolvePayday(2026, 10, { payDay: 0, earlyOnDayOff: false })).toThrow(RangeError);
    expect(() => resolvePayday(2026, 10, { payDay: 32, earlyOnDayOff: false })).toThrow(RangeError);
  });
});

describe("daysUntilPayday — 오늘 포함, 지급일 제외", () => {
  it("11/12 → 11/25 는 13일", () => {
    expect(daysUntilPayday(d(2026, 11, 12), d(2026, 11, 25))).toBe(13);
  });

  it("지급일 전날이면 1일", () => {
    expect(daysUntilPayday(d(2026, 11, 24), d(2026, 11, 25))).toBe(1);
  });

  it("해를 넘겨도 정확 (12/28 → 1/25 는 28일)", () => {
    expect(daysUntilPayday(d(2026, 12, 28), d(2027, 1, 25))).toBe(28);
  });
});
