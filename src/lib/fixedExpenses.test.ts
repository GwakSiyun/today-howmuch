import { describe, expect, it } from "vitest";
import { draftsToExpenses, toDrafts } from "./fixedExpenses";

describe("draftsToExpenses", () => {
  it("콤마 금액을 숫자로, 이름 앞뒤 공백 제거", () => {
    expect(draftsToExpenses([{ id: "a", name: " 월세 ", amountText: "400,000" }])).toEqual({
      ok: true,
      items: [{ id: "a", name: "월세", amount: 400_000, paidFor: null }],
    });
  });

  it("완전히 빈 줄은 무시", () => {
    expect(draftsToExpenses([{ id: "a", name: "", amountText: "" }])).toEqual({ ok: true, items: [] });
  });

  it("이름이나 금액 하나만 있으면 에러", () => {
    expect(draftsToExpenses([{ id: "a", name: "월세", amountText: "" }]).ok).toBe(false);
    expect(draftsToExpenses([{ id: "a", name: "", amountText: "1,000" }]).ok).toBe(false);
  });

  it("편집해도 기존 항목의 '나갔어요' 표시는 유지, 새 항목은 안 나감", () => {
    const existing = [{ id: "a", name: "월세", amount: 400_000, paidFor: "2026-11-25" }];
    const drafts = [...toDrafts(existing), { id: "b", name: "통신비", amountText: "33,000" }];
    drafts[0] = { ...drafts[0], amountText: "410,000" };
    expect(draftsToExpenses(drafts, existing)).toEqual({
      ok: true,
      items: [
        { id: "a", name: "월세", amount: 410_000, paidFor: "2026-11-25" },
        { id: "b", name: "통신비", amount: 33_000, paidFor: null },
      ],
    });
  });
});
