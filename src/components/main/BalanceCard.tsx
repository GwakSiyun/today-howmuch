import { formatWon } from "@/lib/format";

interface BalanceCardProps {
  balance: number;
  daysSinceInput: number;
  onChange: () => void;
}

export default function BalanceCard({ balance, daysSinceInput, onChange }: BalanceCardProps): React.ReactNode {
  return (
    <section className="flex items-center justify-between gap-3 rounded-[10px] bg-card px-5 py-3.5">
      <div className="min-w-0">
        <p className="text-[13px] text-sub">
          남은 잔액 · {daysSinceInput === 0 ? "오늘" : `${daysSinceInput}일 전`}
        </p>
        <p className="mt-1 text-[22px] font-bold tabular-nums">{formatWon(balance)}원</p>
      </div>
      {/* 보이는 버튼은 작게, 터치 영역은 44px */}
      <button type="button" onClick={onChange} className="-mr-1 flex h-11 shrink-0 items-center px-1">
        <span className="flex h-9 items-center rounded-md bg-btn px-3.5 text-[13px] font-bold text-white">바꾸기</span>
      </button>
    </section>
  );
}
