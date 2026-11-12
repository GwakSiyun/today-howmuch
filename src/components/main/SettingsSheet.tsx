// 설정 바텀시트 (A) — 월급날·주말/공휴일 옵션 · 고정 지출 바로가기. 컴팩트 목록형.
import { useId, useState } from "react";
import type { AppData } from "@/lib/storage";
import BottomSheet from "../BottomSheet";
import { parsePayDay } from "../PayDayFields";
import PayDayPicker from "../PayDayPicker";

interface SettingsSheetProps {
  data: AppData;
  onClose: () => void;
  onEditFixed: () => void;
  save: (next: AppData) => boolean;
}

const rowClass = "flex min-h-12 items-center justify-between gap-3 border-b border-line text-sm";

export default function SettingsSheet({ data, onClose, onEditFixed, save }: SettingsSheetProps): React.ReactNode {
  const baseId = useId();
  const { settings } = data;
  const [payDayText, setPayDayText] = useState<string>(String(settings.payDay));
  const [earlyOnDayOff, setEarlyOnDayOff] = useState<boolean>(settings.earlyOnDayOff);
  const [error, setError] = useState<string | null>(null);

  const ruleChanged = payDayText !== String(settings.payDay) || earlyOnDayOff !== settings.earlyOnDayOff;
  const hasPaid = settings.fixedExpenses.some((item) => item.paidFor !== null);

  function handleSubmit(): void {
    const payDay = parsePayDay(payDayText);
    if (payDay === null) {
      setError("돈 들어오는 날을 골라 주세요.");
      return;
    }
    const saved = save({
      ...data,
      settings: {
        ...settings,
        payDay,
        earlyOnDayOff,
        // 월급날이 바뀌면 주기도 바뀌므로 "나갔어요" 표시는 지운다 (엉뚱한 주기에 남지 않게)
        fixedExpenses: ruleChanged
          ? settings.fixedExpenses.map((item) => ({ ...item, paidFor: null }))
          : settings.fixedExpenses,
      },
    });
    if (!saved) {
      setError("이 브라우저에서는 저장이 안 돼요. 비공개 창이라면 일반 창에서 열어 주세요.");
      return;
    }
    onClose();
  }

  const payDayId = `${baseId}-payday`;
  const earlyId = `${baseId}-early`;

  return (
    <BottomSheet title="설정" onClose={onClose} onSubmit={handleSubmit} error={error}>
      <div className="mt-2">
        <div className="border-b border-line">
          <PayDayPicker
            id={payDayId}
            size="compact"
            label="월급날"
            value={parsePayDay(payDayText)}
            onChange={(day) => setPayDayText(String(day))}
          />
        </div>

        <label htmlFor={earlyId} className={`${rowClass} cursor-pointer`}>
          <span>주말·공휴일이면 전날 받아요</span>
          <input
            id={earlyId}
            type="checkbox"
            checked={earlyOnDayOff}
            onChange={(e) => setEarlyOnDayOff(e.target.checked)}
            className="size-4 shrink-0 accent-btn"
          />
        </label>

        <button type="button" onClick={onEditFixed} className={`${rowClass} w-full text-left`}>
          <span>고정 지출</span>
          <span className="text-sub">
            {settings.fixedExpenses.length > 0 ? `${settings.fixedExpenses.length}개 · 편집` : "추가하기"} ›
          </span>
        </button>
      </div>

      <p className="mt-2 text-[11px] text-sub">
        31일처럼 없는 날은 그 달 말일로 계산해요.
        {ruleChanged && hasPaid && " 월급날을 바꾸면 [나갔어요] 표시가 지워져요."}
      </p>
    </BottomSheet>
  );
}
