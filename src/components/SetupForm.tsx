"use client";

import { useId, useState } from "react";
import type { FixedExpense } from "@/lib/budget";
import { formatHeaderDate, formatWon, parseWonInput } from "@/lib/format";
import { toDateKey } from "@/lib/payday";
import { saveAppData } from "@/lib/storage";

interface ExpenseDraft {
  id: string;
  name: string;
  amountText: string;
}

const PAY_DAYS: readonly number[] = Array.from({ length: 31 }, (_, i) => i + 1);

let fallbackId = 0;
function makeId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    fallbackId += 1;
    return `fx-${Date.now()}-${fallbackId}`;
  }
}

/** 입력 중 표시용: 숫자만 남기고 콤마 */
function toWonText(text: string): string {
  const value = parseWonInput(text);
  return value === null ? "" : formatWon(value);
}

// 목업 카드 스타일: 흰 카드 + 작은 회색 라벨 + 굵은 값
const cardClass = "rounded-[10px] border border-transparent bg-card px-5 py-4 focus-within:border-ink";
const labelClass = "text-[13px] text-sub";
const hintClass = "mt-2 text-xs text-sub";
const smallInputClass =
  "h-11 w-full rounded-md border border-line bg-card px-3 text-[15px] text-ink outline-none focus:border-ink";

interface AutoWidthInputProps {
  value: string;
  placeholder: string;
  className: string;
  onChange: (value: string) => void;
  id?: string;
  ariaLabel?: string;
}

/** 입력한 숫자 폭만큼만 늘어나는 입력창 — "265,000원"처럼 단위가 숫자 바로 뒤에 붙게 */
function AutoWidthInput({ value, placeholder, className, onChange, id, ariaLabel }: AutoWidthInputProps): React.ReactNode {
  return (
    <span className="inline-grid min-w-0">
      <span aria-hidden="true" className={`invisible col-start-1 row-start-1 whitespace-pre ${className}`}>
        {value || placeholder}
      </span>
      <input
        id={id}
        aria-label={ariaLabel}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`col-start-1 row-start-1 w-full min-w-0 bg-transparent p-0 outline-none placeholder:text-line ${className}`}
      />
    </span>
  );
}

export default function SetupForm(): React.ReactNode {
  const baseId = useId();
  const [payDayText, setPayDayText] = useState<string>("");
  const [balanceText, setBalanceText] = useState<string>("");
  const [earlyOnDayOff, setEarlyOnDayOff] = useState<boolean>(false);
  const [useFixedExpenses, setUseFixedExpenses] = useState<boolean>(false);
  const [expenses, setExpenses] = useState<ExpenseDraft[]>([]);
  const [error, setError] = useState<string | null>(null);

  function toggleFixedExpenses(): void {
    const next = !useFixedExpenses;
    setUseFixedExpenses(next);
    if (next && expenses.length === 0) {
      setExpenses([{ id: makeId(), name: "", amountText: "" }]);
    }
  }

  function updateExpense(id: string, patch: Partial<Omit<ExpenseDraft, "id">>): void {
    setExpenses((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addExpense(): void {
    setExpenses((prev) => [...prev, { id: makeId(), name: "", amountText: "" }]);
  }

  function removeExpense(id: string): void {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const payDay = Number(payDayText);
    const balance = parseWonInput(balanceText);

    if (!Number.isInteger(payDay) || payDay < 1 || payDay > 31) {
      setError("돈 들어오는 날을 골라 주세요.");
      return;
    }
    if (balance === null) {
      setError("지금 통장 잔액을 입력해 주세요.");
      return;
    }

    // 이름·금액 둘 다 빈 줄은 무시, 하나만 채운 줄은 막기
    const filled = expenses.filter((item) => item.name.trim() !== "" || item.amountText !== "");
    const fixedExpenses: FixedExpense[] = [];
    if (useFixedExpenses) {
      for (const item of filled) {
        const amount = parseWonInput(item.amountText);
        if (item.name.trim() === "" || amount === null) {
          setError("고정 지출은 이름과 금액을 둘 다 적어 주세요.");
          return;
        }
        fixedExpenses.push({ id: item.id, name: item.name.trim(), amount, paidFor: null });
      }
    }

    const saved = saveAppData({
      version: 1,
      settings: { payDay, earlyOnDayOff, useFixedExpenses, fixedExpenses },
      balances: [{ date: toDateKey(new Date()), balance }],
    });
    if (!saved) {
      setError("이 브라우저에서는 저장이 안 돼요. 비공개 창이라면 일반 창에서 열어 주세요.");
      return;
    }
    setError(null);
  }

  const payDayId = `${baseId}-payday`;
  const balanceId = `${baseId}-balance`;
  const weekendId = `${baseId}-weekend`;
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
        <label htmlFor={payDayId} className={labelClass}>
          다음 돈 들어오는 날
        </label>
        <div className="mt-1.5 flex items-center gap-2 text-[22px] font-bold whitespace-nowrap">
          <span className="shrink-0">매달</span>
          <span className="relative shrink-0">
            <select
              id={payDayId}
              value={payDayText}
              onChange={(e) => setPayDayText(e.target.value)}
              className={`h-11 appearance-none rounded-md border border-line bg-card pr-8 pl-3 text-[22px] font-bold tabular-nums outline-none focus:border-ink ${
                payDayText === "" ? "text-sub" : "text-ink"
              }`}
            >
              <option value="" disabled>
                선택
              </option>
              {PAY_DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-sub"
            >
              ▼
            </span>
          </span>
          <span className="shrink-0">일</span>
        </div>
        <p className={hintClass}>31일처럼 없는 날은 그 달 말일로 계산해요.</p>

        <label
          htmlFor={weekendId}
          className="mt-3 flex min-h-11 cursor-pointer items-center gap-2.5 border-t border-line pt-3"
        >
          <input
            id={weekendId}
            type="checkbox"
            checked={earlyOnDayOff}
            onChange={(e) => setEarlyOnDayOff(e.target.checked)}
            className="size-[18px] shrink-0 accent-btn"
          />
          <span className="text-sm">주말·공휴일이면 전날 받아요</span>
        </label>
      </section>

      {/* 2. 지금 통장 잔액 */}
      <section className={cardClass}>
        <label htmlFor={balanceId} className={labelClass}>
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
        <p className={hintClass}>토스·은행 앱에 보이는 숫자 그대로 적어 주세요.</p>
      </section>

      {/* 3. 고정 지출 */}
      <section className={cardClass}>
        <div className="flex min-h-11 items-center justify-between gap-3">
          <div>
            <p id={fixedId} className="text-[15px] font-semibold">
              고정 지출 빼고 계산
            </p>
            <p className="mt-0.5 text-xs text-sub">월세·통신비처럼 아직 안 나간 돈</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={useFixedExpenses}
            aria-labelledby={fixedId}
            onClick={toggleFixedExpenses}
            className={`relative h-7 w-12 shrink-0 rounded-md transition-colors ${
              useFixedExpenses ? "bg-btn" : "bg-line"
            }`}
          >
            <span
              className={`absolute top-1 left-1 size-5 rounded-sm bg-card transition-transform ${
                useFixedExpenses ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {useFixedExpenses && (
          <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
            {expenses.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  type="text"
                  aria-label={`고정 지출 ${index + 1} 이름`}
                  placeholder="예: 월세"
                  value={item.name}
                  onChange={(e) => updateExpense(item.id, { name: e.target.value })}
                  className={`${smallInputClass} min-w-0 flex-1`}
                />
                <div className="relative w-32 shrink-0">
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label={`고정 지출 ${index + 1} 금액`}
                    placeholder="0"
                    value={item.amountText}
                    onChange={(e) => updateExpense(item.id, { amountText: toWonText(e.target.value) })}
                    className={`${smallInputClass} pr-8 text-right font-semibold tabular-nums`}
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-sub">
                    원
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeExpense(item.id)}
                  aria-label={`고정 지출 ${index + 1} 삭제`}
                  className="flex size-11 shrink-0 items-center justify-center rounded-md text-lg text-sub"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addExpense}
              className="h-11 rounded-md border border-dashed border-line text-sm text-sub"
            >
              + 항목 추가
            </button>
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
