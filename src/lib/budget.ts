// 하루 금액 계산 — 순수 함수.
import { daysUntilPayday, nextPayday, toDateKey, type DateKey, type PaydayRule } from "./payday";

export interface FixedExpense {
  id: string;
  name: string;
  /** 원 (0 이상 정수) */
  amount: number;
  /**
   * "나갔어요"를 누른 주기 = 그때의 다음 지급일 키.
   * 다음 지급일이 바뀌면(월급날이 지나면) 자동으로 '아직 안 나감'으로 돌아간다. 안 눌렀으면 null.
   */
  paidFor: DateKey | null;
}

export interface DailyBudgetInput {
  /** 가장 최근에 입력한 잔액 (원) */
  balance: number;
  /** 등록된 고정 지출 전부 (스위치가 꺼져 있으면 빈 배열). 이번 주기에 나간 건 여기서 걸러낸다 */
  fixedExpenses: readonly FixedExpense[];
  today: Date;
  rule: PaydayRule;
}

export interface DailyBudget {
  /** 오늘 써도 되는 돈 (원 단위 내림). 0 이하면 음수 그대로 — 화면에도 마이너스로 표시 */
  daily: number;
  /** 잔액 − 아직 안 나간 고정 지출 합 */
  spendable: number;
  /** 아직 안 나간 고정 지출 합 */
  fixedTotal: number;
  /** 오늘 포함 남은 날수 */
  daysLeft: number;
  payday: Date;
  /** 이번 주기를 가리키는 키 ("나갔어요" 저장에 사용) */
  cycleKey: DateKey;
}

/** 이번 주기(cycleKey)에 "나갔어요"를 눌렀는지 */
export function isPaidThisCycle(item: FixedExpense, cycleKey: DateKey): boolean {
  return item.paidFor === cycleKey;
}

export function unpaidFixedExpenses(
  items: readonly FixedExpense[],
  cycleKey: DateKey,
): FixedExpense[] {
  return items.filter((item) => !isPaidThisCycle(item, cycleKey));
}

/** "나갔어요" 딸깍 — 이미 눌렀으면 취소 */
export function togglePaid(
  items: readonly FixedExpense[],
  id: string,
  cycleKey: DateKey,
): FixedExpense[] {
  return items.map((item) => {
    if (item.id !== id) return item;
    return { ...item, paidFor: isPaidThisCycle(item, cycleKey) ? null : cycleKey };
  });
}

export function sumFixedExpenses(items: readonly FixedExpense[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function calcDailyBudget(input: DailyBudgetInput): DailyBudget {
  const payday = nextPayday(input.today, input.rule);
  const cycleKey = toDateKey(payday);
  const daysLeft = daysUntilPayday(input.today, payday);
  const fixedTotal = sumFixedExpenses(unpaidFixedExpenses(input.fixedExpenses, cycleKey));
  const spendable = input.balance - fixedTotal;
  // 써도 되는 돈을 부풀리지 않도록 내림
  const daily = Math.floor(spendable / daysLeft);
  return { daily, spendable, fixedTotal, daysLeft, payday, cycleKey };
}
