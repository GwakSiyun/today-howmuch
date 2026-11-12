// 공용 바텀시트 틀 — 배경 누르기·Esc로 닫기, 아래쪽 [닫기][저장] 버튼
import { useEffect, useId } from "react";

interface BottomSheetProps {
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  error: string | null;
  submitLabel?: string;
  children: React.ReactNode;
}

export default function BottomSheet({
  title,
  onClose,
  onSubmit,
  error,
  submitLabel = "저장",
  children,
}: BottomSheetProps): React.ReactNode {
  const titleId = useId();

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={handleSubmit}
        noValidate
        className="relative max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-t-[10px] bg-card px-5 pt-4 pb-[max(16px,env(safe-area-inset-bottom))]"
      >
        <p id={titleId} className="text-[15px] font-bold">
          {title}
        </p>
        {children}

        {error && (
          <p role="alert" className="mt-3 text-sm text-danger-badge">
            {error}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="h-11 w-20 rounded-md border border-line text-sm text-sub">
            닫기
          </button>
          <button type="submit" className="h-11 flex-1 rounded-md bg-btn text-sm font-semibold text-white">
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
