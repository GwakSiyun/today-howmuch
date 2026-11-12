// 첫 설정 카드: "매달 [N] 일"(날짜판) + "주말·공휴일이면 전날 받아요"
import { useId } from "react";
import PayDayPicker from "./PayDayPicker";

interface PayDayFieldsProps {
  /** "" = 아직 안 고름 */
  payDayText: string;
  earlyOnDayOff: boolean;
  onPayDayChange: (value: string) => void;
  onEarlyChange: (value: boolean) => void;
}

export default function PayDayFields({
  payDayText,
  earlyOnDayOff,
  onPayDayChange,
  onEarlyChange,
}: PayDayFieldsProps): React.ReactNode {
  const baseId = useId();
  const payDayId = `${baseId}-payday`;
  const earlyId = `${baseId}-early`;

  return (
    <>
      <label htmlFor={payDayId} className="text-[13px] text-sub">
        다음 돈 들어오는 날
      </label>
      <div className="mt-1">
        <PayDayPicker
          id={payDayId}
          size="large"
          value={parsePayDay(payDayText)}
          onChange={(day) => onPayDayChange(String(day))}
        />
      </div>
      <p className="mt-2 text-xs text-sub">31일처럼 없는 날은 그 달 말일로 계산해요.</p>

      <label htmlFor={earlyId} className="mt-3 flex min-h-11 cursor-pointer items-center gap-2.5 border-t border-line pt-3">
        <input
          id={earlyId}
          type="checkbox"
          checked={earlyOnDayOff}
          onChange={(e) => onEarlyChange(e.target.checked)}
          className="size-4 shrink-0 accent-btn"
        />
        <span className="text-sm">주말·공휴일이면 전날 받아요</span>
      </label>
    </>
  );
}

/** "" 또는 범위 밖이면 null */
export function parsePayDay(text: string): number | null {
  const value = Number(text);
  return text !== "" && Number.isInteger(value) && value >= 1 && value <= 31 ? value : null;
}
