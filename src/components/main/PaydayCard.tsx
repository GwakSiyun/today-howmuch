import { formatShortDate } from '@/lib/format';

interface PaydayCardProps {
  daysLeft: number;
  payday: Date;
  /** 지난 월급날 → 다음 월급날 사이 지난 비율 0~1 */
  progress: number;
}

export default function PaydayCard({
  daysLeft,
  payday,
  progress,
}: PaydayCardProps): React.ReactNode {
  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <section className="rounded-[10px] bg-card px-5 pt-4 pb-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] text-sub">월급날까지</p>
        <p className="text-lg font-bold tabular-nums">
          {daysLeft}일 · {formatShortDate(payday)}
        </p>
      </div>
      {/* 진행 막대 — 끝만 살짝 둥글게(2px, 알약 모양 아님) */}
      <div
        role="progressbar"
        aria-label="지난 월급날부터 지난 정도"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="mt-3 h-1.5 w-full overflow-hidden rounded-[2px] bg-line"
      >
        <div className="h-full rounded-[2px] bg-btn" style={{ width: `${percent}%` }} />
      </div>
    </section>
  );
}
