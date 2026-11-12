// 월급날 고르기 — 브라우저 기본 드롭다운 대신 1~31 날짜판(7칸씩).
// 버튼을 누르면 아래로 펼쳐지고, 날짜를 누르면 접힌다.
import { useState } from "react";

const DAYS: readonly number[] = Array.from({ length: 31 }, (_, i) => i + 1);

interface PayDayPickerProps {
  /** null = 아직 안 고름 */
  value: number | null;
  onChange: (day: number) => void;
  /** large = 첫 설정 카드(22px 굵게), compact = 설정 시트 목록 */
  size: "large" | "compact";
  id?: string;
  /** compact일 때 줄 왼쪽에 놓을 이름 (날짜판은 줄 전체 폭으로 펼쳐짐) */
  label?: string;
}

export default function PayDayPicker({ value, onChange, size, id, label }: PayDayPickerProps): React.ReactNode {
  const [open, setOpen] = useState<boolean>(value === null && size === "large");
  const gridId = `${id ?? "payday"}-grid`;

  const trigger =
    size === "large" ? (
      <button
        id={id}
        type="button"
        aria-expanded={open}
        aria-controls={gridId}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 items-center gap-2 text-[22px] font-bold whitespace-nowrap"
      >
        매달
        <span
          className={`inline-flex h-10 min-w-12 items-center justify-center rounded-md border px-2 tabular-nums ${
            open ? "border-ink" : "border-line"
          } ${value === null ? "text-sub/50" : "text-ink"}`}
        >
          {value ?? "–"}
        </span>
        일
        <span aria-hidden="true" className={`ml-0.5 text-xs text-sub transition-transform ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
    ) : (
      <button
        id={id}
        type="button"
        aria-expanded={open}
        aria-controls={gridId}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-12 w-full items-center justify-between gap-3 text-sm whitespace-nowrap"
      >
        <span>{label}</span>
        <span className="flex items-center gap-1">
          매달 <span className="font-semibold tabular-nums">{value ?? "–"}</span>일
          <span aria-hidden="true" className={`ml-1 text-[9px] text-sub transition-transform ${open ? "rotate-180" : ""}`}>
            ▼
          </span>
        </span>
      </button>
    );

  return (
    <div>
      {trigger}
      {open && (
        <div
          id={gridId}
          role="group"
          aria-label="매달 받는 날"
          className={`grid grid-cols-7 gap-1 ${size === "large" ? "mt-2" : "mb-3"}`}
        >
          {DAYS.map((day) => {
            const selected = day === value;
            return (
              <button
                key={day}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  onChange(day);
                  setOpen(false);
                }}
                className={`h-9 rounded-md text-[13px] tabular-nums transition-colors ${
                  selected ? "bg-btn font-bold text-white" : "bg-bg text-ink hover:bg-line"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
