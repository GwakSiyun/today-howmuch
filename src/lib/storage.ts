// 기기 localStorage 저장소. 서버·DB 없음.
// 읽기/쓰기는 전부 try/catch — 비공개 창·차단·용량 초과·깨진 JSON이면 null(=첫 설정 화면).
import type { FixedExpense } from "./budget";
import type { DateKey } from "./payday";

export const STORAGE_KEY = "today-howmuch:v1";

export interface Settings {
  payDay: number;
  earlyOnDayOff: boolean;
  useFixedExpenses: boolean;
  fixedExpenses: FixedExpense[];
}

export interface BalanceEntry {
  date: DateKey;
  balance: number;
}

export interface AppData {
  version: 1;
  settings: Settings;
  /** 입력한 날만, 오래된 순 */
  balances: BalanceEntry[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function isFixedExpense(value: unknown): value is FixedExpense {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isFiniteInt(value.amount) &&
    value.amount >= 0 &&
    (value.paidFor === null || isDateKey(value.paidFor))
  );
}

function isDateKey(value: unknown): value is DateKey {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isBalanceEntry(value: unknown): value is BalanceEntry {
  return (
    isRecord(value) &&
    isDateKey(value.date) &&
    isFiniteInt(value.balance)
  );
}

function isSettings(value: unknown): value is Settings {
  return (
    isRecord(value) &&
    isFiniteInt(value.payDay) &&
    value.payDay >= 1 &&
    value.payDay <= 31 &&
    typeof value.earlyOnDayOff === "boolean" &&
    typeof value.useFixedExpenses === "boolean" &&
    Array.isArray(value.fixedExpenses) &&
    value.fixedExpenses.every(isFixedExpense)
  );
}

/** 저장된 원본 문자열 → AppData. 형식이 하나라도 틀리면 null */
export function parseAppData(raw: string | null): AppData | null {
  if (raw === null) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !isSettings(value.settings) ||
    !Array.isArray(value.balances) ||
    !value.balances.every(isBalanceEntry) ||
    value.balances.length === 0
  ) {
    return null;
  }
  return { version: 1, settings: value.settings, balances: value.balances };
}

/**
 * 잔액 기록 추가. 같은 날 다시 입력하면 그날 값을 덮어쓴다(하루 1건). 날짜 오름차순 유지.
 * 입력하지 않은 날은 만들지 않는다.
 */
export function upsertBalance(
  balances: readonly BalanceEntry[],
  entry: BalanceEntry,
): BalanceEntry[] {
  const others = balances.filter((item) => item.date !== entry.date);
  return [...others, entry].sort((a, b) => a.date.localeCompare(b.date));
}

// ── 브라우저 전용 (useSyncExternalStore용) ──

const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** 저장 성공 여부 반환 (실패해도 앱이 죽지 않게) */
export function saveAppData(data: AppData): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    emit();
    return true;
  } catch {
    return false;
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent): void => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
