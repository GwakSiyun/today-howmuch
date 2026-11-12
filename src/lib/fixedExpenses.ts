// 고정 지출 입력 칸(초안) ↔ 저장 값 변환 — 순수 함수.
import type { FixedExpense } from "./budget";
import { formatWon, parseWonInput } from "./format";

export interface ExpenseDraft {
  id: string;
  name: string;
  /** 콤마 들어간 입력 문자열 */
  amountText: string;
}

export type DraftResult = { ok: true; items: FixedExpense[] } | { ok: false; message: string };

let fallbackId = 0;
export function makeId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    fallbackId += 1;
    return `fx-${Date.now()}-${fallbackId}`;
  }
}

export function emptyDraft(): ExpenseDraft {
  return { id: makeId(), name: "", amountText: "" };
}

export function toDrafts(items: readonly FixedExpense[]): ExpenseDraft[] {
  return items.map((item) => ({ id: item.id, name: item.name, amountText: formatWon(item.amount) }));
}

/**
 * 입력 칸 → 저장 값.
 * - 이름·금액 둘 다 빈 줄은 무시, 하나만 채운 줄은 에러
 * - 기존 항목(같은 id)의 "나갔어요" 표시는 유지
 */
export function draftsToExpenses(
  drafts: readonly ExpenseDraft[],
  existing: readonly FixedExpense[] = [],
): DraftResult {
  const paidById = new Map(existing.map((item) => [item.id, item.paidFor]));
  const items: FixedExpense[] = [];
  for (const draft of drafts) {
    const name = draft.name.trim();
    const amount = parseWonInput(draft.amountText);
    if (name === "" && amount === null) continue;
    if (name === "" || amount === null) {
      return { ok: false, message: "고정 지출은 이름과 금액을 둘 다 적어 주세요." };
    }
    items.push({ id: draft.id, name, amount, paidFor: paidById.get(draft.id) ?? null });
  }
  return { ok: true, items };
}
