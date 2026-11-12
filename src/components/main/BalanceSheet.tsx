// 잔액 바꾸기 바텀시트 — 숫자 하나만. 같은 날 다시 넣으면 덮어쓰기.
import { useId, useState } from "react";
import { parseWonInput, toWonText } from "@/lib/format";
import { toDateKey } from "@/lib/payday";
import { upsertBalance, type AppData } from "@/lib/storage";
import AutoWidthInput from "../AutoWidthInput";
import BottomSheet from "../BottomSheet";

interface BalanceSheetProps {
  data: AppData;
  onClose: () => void;
  save: (next: AppData) => boolean;
}

export default function BalanceSheet({ data, onClose, save }: BalanceSheetProps): React.ReactNode {
  const inputId = useId();
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(): void {
    const balance = parseWonInput(text);
    if (balance === null) {
      setError("지금 잔액을 입력해 주세요.");
      return;
    }
    const saved = save({
      ...data,
      balances: upsertBalance(data.balances, { date: toDateKey(new Date()), balance }),
    });
    if (!saved) {
      setError("이 브라우저에서는 저장이 안 돼요. 비공개 창이라면 일반 창에서 열어 주세요.");
      return;
    }
    onClose();
  }

  return (
    <BottomSheet title="지금 잔액" onClose={onClose} onSubmit={handleSubmit} error={error}>
      <label htmlFor={inputId} className="mt-3 flex min-h-12 cursor-text items-baseline border-b border-line pb-2">
        <AutoWidthInput
          id={inputId}
          ariaLabel="지금 잔액"
          value={text}
          placeholder="0"
          autoFocus
          onChange={(value) => setText(toWonText(value))}
          className="text-2xl font-bold tabular-nums text-ink"
        />
        <span className="ml-0.5 shrink-0 text-2xl font-bold">원</span>
      </label>
      <p className="mt-2 text-xs text-sub">토스·은행 앱에 보이는 숫자 그대로 적어 주세요.</p>
    </BottomSheet>
  );
}
