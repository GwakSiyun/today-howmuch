// 고정 지출 [나갔어요] — 목업에 없는 카드라 맨 아래에 둠 (배치 확정 전)
import { isPaidThisCycle, togglePaid } from "@/lib/budget";
import { formatWon } from "@/lib/format";
import type { DateKey } from "@/lib/payday";
import type { AppData } from "@/lib/storage";

interface FixedExpenseCardProps {
  data: AppData;
  cycleKey: DateKey;
  save: (next: AppData) => boolean;
  onEdit: () => void;
}

export default function FixedExpenseCard({ data, cycleKey, save, onEdit }: FixedExpenseCardProps): React.ReactNode {
  const { settings } = data;

  function handleToggle(id: string): void {
    // 저장 실패하면 화면은 이전 값 그대로 (거짓 성공 표시 안 함)
    save({
      ...data,
      settings: { ...settings, fixedExpenses: togglePaid(settings.fixedExpenses, id, cycleKey) },
    });
  }

  return (
    <section className="rounded-[10px] bg-card px-5 pt-1.5 pb-2">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-sub">고정 지출 · 나가면 눌러 주세요</p>
        <button type="button" onClick={onEdit} className="-mr-2 min-h-11 px-2 text-[13px] text-sub underline underline-offset-2">
          편집
        </button>
      </div>
      <ul className="divide-y divide-line">
        {settings.fixedExpenses.map((item) => {
          const paid = isPaidThisCycle(item, cycleKey);
          return (
            <li key={item.id} className="flex items-center justify-between gap-3 py-1">
              <span className={`text-[15px] ${paid ? "text-sub line-through" : ""}`}>
                {item.name} <span className="font-semibold tabular-nums">{formatWon(item.amount)}원</span>
              </span>
              <button
                type="button"
                aria-pressed={paid}
                onClick={() => handleToggle(item.id)}
                className="-mr-1 flex h-11 shrink-0 items-center px-1"
              >
                <span
                  className={`flex h-8 items-center rounded-md px-3 text-[13px] font-bold ${
                    paid ? "border border-line text-sub" : "bg-btn text-white"
                  }`}
                >
                  {paid ? "취소" : "나갔어요"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
