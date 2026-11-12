// 고정 지출 추가·편집 바텀시트 (B) — 첫 설정에서 건너뛴 경우에도 여기서 넣는다
import { useState } from "react";
import { draftsToExpenses, emptyDraft, toDrafts, type ExpenseDraft } from "@/lib/fixedExpenses";
import type { AppData } from "@/lib/storage";
import BottomSheet from "../BottomSheet";
import FixedExpenseFields from "../FixedExpenseFields";

interface FixedExpenseSheetProps {
  data: AppData;
  onClose: () => void;
  save: (next: AppData) => boolean;
}

export default function FixedExpenseSheet({ data, onClose, save }: FixedExpenseSheetProps): React.ReactNode {
  const existing = data.settings.fixedExpenses;
  const [drafts, setDrafts] = useState<ExpenseDraft[]>(() =>
    existing.length > 0 ? toDrafts(existing) : [emptyDraft()],
  );
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(): void {
    const result = draftsToExpenses(drafts, existing);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    const saved = save({
      ...data,
      settings: {
        ...data.settings,
        // 항목을 다 지우면 고정 지출 빼기도 꺼진다
        useFixedExpenses: result.items.length > 0,
        fixedExpenses: result.items,
      },
    });
    if (!saved) {
      setError("이 브라우저에서는 저장이 안 돼요. 비공개 창이라면 일반 창에서 열어 주세요.");
      return;
    }
    onClose();
  }

  return (
    <BottomSheet title="고정 지출" onClose={onClose} onSubmit={handleSubmit} error={error}>
      <p className="mt-1 mb-3 text-xs text-sub">월세·통신비처럼 월급날 전까지 나갈 돈이에요. 나가면 [나갔어요]를 눌러 주세요.</p>
      <FixedExpenseFields drafts={drafts} onChange={setDrafts} />
    </BottomSheet>
  );
}
