import type { BudgetStatus } from "@/lib/constants";
import { STATUS_LABEL } from "@/lib/constants";
import { conversionLine } from "@/lib/conversion";
import { formatWon } from "@/lib/format";

// Tailwind가 클래스를 찾을 수 있게 전체 문자열로 둔다
const STATUS_STYLE: Readonly<Record<BudgetStatus, { card: string; badge: string; sub: string }>> = {
  relaxed: { card: "bg-relaxed-card", badge: "bg-relaxed-badge", sub: "text-relaxed-sub" },
  tight: { card: "bg-tight-card", badge: "bg-tight-badge", sub: "text-tight-sub" },
  danger: { card: "bg-danger-card", badge: "bg-danger-badge", sub: "text-danger-sub" },
};

interface AmountCardProps {
  daily: number;
  status: BudgetStatus;
  daysSinceInput: number;
  onChangeBalance: () => void;
}

export default function AmountCard({ daily, status, daysSinceInput, onChangeBalance }: AmountCardProps): React.ReactNode {
  const style = STATUS_STYLE[status];
  const conversion = conversionLine(daily);

  return (
    <section className={`rounded-[10px] px-5 pt-4 pb-4 ${style.card}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`pt-0.5 text-[13px] ${style.sub}`}>오늘 써도 되는 돈</p>
        <span className={`rounded-[4px] px-2 py-0.5 text-[13px] font-bold text-white ${style.badge}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      <p className="mt-2 flex items-baseline text-ink">
        <span className="text-[42px] leading-none font-extrabold tracking-tight tabular-nums">{formatWon(daily)}</span>
        <span className="ml-1 text-xl font-bold">원</span>
      </p>

      {conversion && <p className={`mt-3 text-[11px] ${style.sub}`}>{conversion}</p>}

      {daysSinceInput >= 2 && (
        <p className={`mt-1 flex items-center text-xs ${style.sub}`}>
          {daysSinceInput}일 전 잔액 기준이에요 ·
          <button type="button" onClick={onChangeBalance} className="ml-1 min-h-11 font-semibold underline underline-offset-2">
            바꾸기
          </button>
        </p>
      )}
    </section>
  );
}
