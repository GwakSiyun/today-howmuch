// 잔액 기록 → "지난번보다" 비교·막대 — 순수 함수.
// 입력한 날만 쓴다. 입력 안 한 날은 채우거나 추정하지 않는다.
import { calcDailyBudget } from "./budget";
import { diffInDays, fromDateKey, type DateKey } from "./payday";
import type { BalanceEntry, Settings } from "./storage";

export interface HistoryPoint {
  date: DateKey;
  /** 그 입력 날짜 기준 하루 써도 되는 돈 */
  daily: number;
}

export interface Comparison {
  /** 최근 입력 기준 하루 금액 − 직전 입력 기준 하루 금액 */
  diff: number;
  /** 직전 입력이 최근 입력보다 며칠 전인지 */
  daysBetween: number;
}

/**
 * 입력 날짜 기준 하루 금액.
 * 고정 지출은 현재 목록 중 그 입력의 주기에 "나갔어요"가 아닌 것만 뺀다
 * (나갔어요를 누른 '날짜'는 저장하지 않아서, 같은 주기 안에서는 나중에 누른 것도 반영됨).
 */
export function dailyAtEntry(entry: BalanceEntry, settings: Settings): number {
  return calcDailyBudget({
    balance: entry.balance,
    fixedExpenses: settings.useFixedExpenses ? settings.fixedExpenses : [],
    today: fromDateKey(entry.date),
    rule: { payDay: settings.payDay, earlyOnDayOff: settings.earlyOnDayOff },
  }).daily;
}

/** 최근 입력 최대 limit개 (오래된 순) */
export function recentHistory(
  balances: readonly BalanceEntry[],
  settings: Settings,
  limit = 5,
): HistoryPoint[] {
  return balances.slice(-limit).map((entry) => ({ date: entry.date, daily: dailyAtEntry(entry, settings) }));
}

/** 입력이 2번 이상일 때만 비교값. 1번뿐이면 null */
export function compareLastTwo(balances: readonly BalanceEntry[], settings: Settings): Comparison | null {
  if (balances.length < 2) return null;
  const prev = balances[balances.length - 2];
  const last = balances[balances.length - 1];
  return {
    diff: dailyAtEntry(last, settings) - dailyAtEntry(prev, settings),
    daysBetween: diffInDays(fromDateKey(prev.date), fromDateKey(last.date)),
  };
}
