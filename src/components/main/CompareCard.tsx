import { formatShortDate, formatSignedWon } from "@/lib/format";
import type { Comparison, HistoryPoint } from "@/lib/history";
import { fromDateKey, toDateKey } from "@/lib/payday";

interface CompareCardProps {
  comparison: Comparison | null;
  history: HistoryPoint[];
  today: Date;
}

const BAR_MAX_PX = 48;
const BAR_MIN_PX = 4;

export default function CompareCard({ comparison, history, today }: CompareCardProps): React.ReactNode {
  // 입력이 1번뿐이면 비교 대신 안내 (가짜 막대 없음)
  if (comparison === null) {
    return (
      <section className="rounded-[10px] border border-dashed border-sub/40 px-5 py-5 text-center text-[13px] text-sub">
        잔액을 한 번 더 입력하면 변화를 보여 줘요
      </section>
    );
  }

  const max = Math.max(...history.map((p) => p.daily), 0);
  const todayKey = toDateKey(today);
  const diffClass = comparison.diff < 0 ? "text-decrease" : "text-ink";

  return (
    <section className="flex items-end justify-between gap-4 rounded-[10px] bg-card px-5 py-4">
      <div className="min-w-0 pb-4">
        <p className="text-[13px] text-sub">지난번({comparison.daysBetween}일 전)보다</p>
        <p className={`mt-1 text-[22px] font-bold tabular-nums ${diffClass}`}>
          {comparison.diff === 0 ? "하루 그대로" : `하루 ${formatSignedWon(comparison.diff)}`}
        </p>
      </div>

      <ol className="flex shrink-0 items-end gap-1" aria-label="입력한 날 기준 하루 금액">
        {history.map((point, index) => {
          const isLast = index === history.length - 1;
          const height =
            max > 0 ? Math.max(BAR_MIN_PX, Math.round((Math.max(point.daily, 0) / max) * BAR_MAX_PX)) : BAR_MIN_PX;
          const label = point.date === todayKey ? "오늘" : formatShortDate(fromDateKey(point.date));
          return (
            <li key={point.date} className="flex w-8 flex-col items-center gap-1">
              <span className="flex h-12 items-end">
                <span className={`block w-4 ${isLast ? "bg-btn" : "bg-line"}`} style={{ height }} />
              </span>
              <span className="text-[10px] whitespace-nowrap text-sub tabular-nums">{label}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
