// 고정 지출 [이름 + 금액] 줄 목록 — 첫 설정·고정 지출 시트 공용
import { toWonText } from "@/lib/format";
import { emptyDraft, type ExpenseDraft } from "@/lib/fixedExpenses";

interface FixedExpenseFieldsProps {
  drafts: ExpenseDraft[];
  onChange: (next: ExpenseDraft[]) => void;
}

const inputClass =
  "h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-ink";

export default function FixedExpenseFields({ drafts, onChange }: FixedExpenseFieldsProps): React.ReactNode {
  function update(id: string, patch: Partial<Omit<ExpenseDraft, "id">>): void {
    onChange(drafts.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <div className="flex flex-col gap-2">
      {drafts.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <input
            type="text"
            aria-label={`고정 지출 ${index + 1} 이름`}
            placeholder="예: 월세"
            value={item.name}
            onChange={(e) => update(item.id, { name: e.target.value })}
            className={`${inputClass} min-w-0 flex-1`}
          />
          <div className="relative w-32 shrink-0">
            <input
              type="text"
              inputMode="numeric"
              aria-label={`고정 지출 ${index + 1} 금액`}
              placeholder="0"
              value={item.amountText}
              onChange={(e) => update(item.id, { amountText: toWonText(e.target.value) })}
              className={`${inputClass} pr-8 text-right font-semibold tabular-nums`}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-sub">원</span>
          </div>
          <button
            type="button"
            onClick={() => onChange(drafts.filter((d) => d.id !== item.id))}
            aria-label={`고정 지출 ${index + 1} 삭제`}
            className="flex size-10 shrink-0 items-center justify-center rounded-md text-base text-sub"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...drafts, emptyDraft()])}
        className="h-10 rounded-md border border-dashed border-line text-[13px] text-sub"
      >
        + 항목 추가
      </button>
    </div>
  );
}
