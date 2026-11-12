// 날짜 경계 처리 — 순수 함수만. 모든 날짜는 기기 로컬 시간의 "날짜"(시각 무시)로 다룬다.
import { HOLIDAYS } from "./holidays.data";

/** YYYY-MM-DD (로컬 날짜) */
export type DateKey = string;

export interface PaydayRule {
  /** 매달 N일 (1~31) */
  payDay: number;
  /** 주말(토·일)·공휴일이면 직전 평일에 받음 */
  earlyOnDayOff: boolean;
}

/** 공휴일 판정 함수. 기본은 천문연 데이터 표(holidays.data.ts) */
export type HolidayLookup = (key: DateKey) => boolean;

/** 표에 없는 연도(HOLIDAY_YEARS 밖)는 공휴일을 모르므로 false → 주말만 당겨진다 */
export const isKoreanHoliday: HolidayLookup = (key) => HOLIDAYS.has(key);

const MS_PER_DAY = 86_400_000;

/** 시각을 버리고 로컬 자정으로 맞춘 새 Date */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** monthIndex: 0~11 (범위 밖이면 연도로 넘어감) */
export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** 두 날짜 사이 일수 (to − from). 시각·서머타임 영향 없이 날짜만 비교 */
export function diffInDays(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / MS_PER_DAY);
}

function assertPayDay(payDay: number): void {
  if (!Number.isInteger(payDay) || payDay < 1 || payDay > 31) {
    throw new RangeError(`payDay는 1~31 정수여야 해요: ${payDay}`);
  }
}

function isDayOff(date: Date, isHoliday: HolidayLookup): boolean {
  const weekday = date.getDay(); // 0=일, 6=토
  return weekday === 0 || weekday === 6 || isHoliday(toDateKey(date));
}

/**
 * 특정 달의 실제 지급일.
 * - 그 달에 없는 날(31일 등)은 말일로
 * - 옵션이 켜져 있으면 주말·공휴일을 건너뛰어 직전 평일로 (전달로 넘어갈 수 있음)
 */
export function resolvePayday(
  year: number,
  monthIndex: number,
  rule: PaydayRule,
  isHoliday: HolidayLookup = isKoreanHoliday,
): Date {
  assertPayDay(rule.payDay);
  const day = Math.min(rule.payDay, daysInMonth(year, monthIndex));
  const date = new Date(year, monthIndex, day);
  if (!rule.earlyOnDayOff) return date;

  // 설·추석 연휴+주말+대체공휴일이 겹쳐도 2주 안에는 평일이 나온다
  for (let back = 0; back < 14; back += 1) {
    const candidate = new Date(year, monthIndex, day - back);
    if (!isDayOff(candidate, isHoliday)) return candidate;
  }
  throw new Error("직전 평일을 찾지 못했어요");
}

/**
 * 오늘 이후(오늘 제외) 가장 가까운 실제 지급일.
 * 오늘이 지급일이면 다음 달 지급일을 돌려준다.
 */
export function nextPayday(
  today: Date,
  rule: PaydayRule,
  isHoliday: HolidayLookup = isKoreanHoliday,
): Date {
  const base = startOfDay(today);
  // 당겨지는 방향만 있으므로 이번 달부터 보면 충분. 1일 지급+휴일 옵션은 다다음 달까지 볼 수 있음.
  for (let offset = 0; offset < 3; offset += 1) {
    const candidate = resolvePayday(base.getFullYear(), base.getMonth() + offset, rule, isHoliday);
    if (diffInDays(base, candidate) > 0) return candidate;
  }
  // 위 루프에서 항상 찾지만, 타입상 반환 보장
  throw new Error("다음 지급일을 찾지 못했어요");
}

/** 오늘부터 지급일 전날까지 남은 날수(오늘 포함). 항상 1 이상 */
export function daysUntilPayday(today: Date, payday: Date): number {
  return Math.max(1, diffInDays(today, payday));
}
