"use client";

import { useId, useState } from "react";
import { emptyDraft, draftsToExpenses, type ExpenseDraft } from "@/lib/fixedExpenses";
import { formatHeaderDate, parseWonInput, toWonText } from "@/lib/format";
import { toDateKey } from "@/lib/payday";
import { saveAppData } from "@/lib/storage";
import AutoWidthInput from "./AutoWidthInput";
import FixedExpenseFields from "./FixedExpenseFields";
import PayDayFields, { parsePayDay } from "./PayDayFields";

// 목업 카드 스타일: 흰 카드 + 작은 회색 라벨 + 굵은 값
const cardClass = "rounded-[10px] border border-transparent bg-card px-5 py-4 focus-within:border-ink";

export default function SetupForm(): React.ReactNode {
  const baseId = useId();
  const [payDayText, setPayDayText] = useState<string>("");
  const [balanceText, setBalanceText] = useState<string>("");
  const [earlyOnDayOff, setEarlyOnDayOff] = useState<boolean>(false);
  const [useFixedExpenses, setUseFixedExpenses] = useState<boolean>(false);
  const [drafts, setDrafts] = useState<ExpenseDraft[]>([]);
  const [error, setError] = useState<string | null>(null);

  function toggleFixedExpenses(): void {
    const next = !useFixedExpenses;
    setUseFixedExpenses(next);
    if (next && drafts.length === 0) setDrafts([emptyDraft()]);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const payDay = parsePayDay(payDayText);
    const balance = parseWonInput(balanceText);

    if (payDay === null) {
      setError("돈 들어오는 날을 골라 주세요.");
      return;
    }
    if (balance === null) {
      setError("지금 통장 잔액을 입력해 주세요.");
      return;
    }

    const fixed = useFixedExpenses ? draftsToExpenses(drafts) : { ok: true as const, items: [] };
    if (!fixed.ok) {
      setError(fixed.message);
      return;
    }

    const saved = saveAppData({
      version: 1,
      settings: {
        payDay,
        earlyOnDayOff,
        // 스위치를 켰어도 항목이 하나도 없으면 끈 것과 같다
        useFixedExpenses: fixed.items.length > 0,
        fixedExpenses: fixed.items,
      },
      balances: [{ date: toDateKey(new Date()), balance }],
    });
    if (!saved) {
      setError("이 브라우저에서는 저장이 안 돼요. 비공개 창이라면 일반 창에서 열어 주세요.");
      return;
    }
    setError(null);
  }

  const balanceId = `${baseId}-balance`;
  const fixedId = `${baseId}-fixed`;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <header className="flex items-baseline justify-between pb-1">
        <h1 className="text-lg font-bold">오늘얼마</h1>
        <span className="text-sm text-sub">{formatHeaderDate(new Date())}</span>
      </header>
      <p className="pb-2 text-sm text-sub">두 가지만 알려 주면 오늘 써도 되는 돈을 계산해요.</p>

      {/* 1. 다음 돈 들어오는 날 */}
      <section className={cardClass}>
        <PayDayFields
          payDayText={payDayText}
          earlyOnDayOff={earlyOnDayOff}
          onPayDayChange={setPayDayText}
          onEarlyChange={setEarlyOnDayOff}
        />
      </section>

      {/* 2. 지금 통장 잔액 */}
      <section className={cardClass}>
        <label htmlFor={balanceId} className="text-[13px] text-sub">
          지금 통장 잔액
        </label>
        <label htmlFor={balanceId} className="mt-1.5 flex min-h-11 cursor-text items-baseline">
          <AutoWidthInput
            id={balanceId}
            value={balanceText}
            placeholder="0"
            onChange={(text) => setBalanceText(toWonText(text))}
            className="text-[22px] font-bold tabular-nums text-ink"
          />
          <span className="ml-0.5 shrink-0 text-[22px] font-bold">원</span>
        </label>
        <p className="mt-2 text-xs text-sub">토스·은행 앱에 보이는 숫자 그대로 적어 주세요.</p>
      </section>

      {/* 3. 고정 지출 (나중에 메인에서도 추가 가능) */}
      <section className={cardClass}>
        <div className="flex min-h-11 items-center justify-between gap-3">
          <div>
            <p id={fixedId} className="text-[15px] font-semibold">
              고정 지출 빼고 계산
            </p>
            <p className="mt-0.5 text-xs text-sub">월세·통신비처럼 아직 안 나간 돈 · 나중에 넣어도 돼요</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={useFixedExpenses}
            aria-labelledby={fixedId}
            onClick={toggleFixedExpenses}
            className={`relative h-7 w-12 shrink-0 rounded-md transition-colors ${useFixedExpenses ? "bg-btn" : "bg-line"}`}
          >
            <span
              className={`absolute top-1 left-1 size-5 rounded-sm bg-card transition-transform ${
                useFixedExpenses ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {useFixedExpenses && (
          <div className="mt-3 border-t border-line pt-3">
            <FixedExpenseFields drafts={drafts} onChange={setDrafts} />
          </div>
        )}
      </section>

      {error && (
        <p role="alert" className="px-1 text-sm text-danger-badge">
          {error}
        </p>
      )}

      <button type="submit" className="mt-2 h-12 rounded-md bg-btn text-[15px] font-semibold text-white">
        시작하기
      </button>
    </form>
  );
}
