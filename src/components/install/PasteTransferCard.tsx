// 아이폰 홈 화면 앱 첫 설정 화면: 사파리에서 복사한 값 붙여넣기
// 아이폰은 홈 화면 앱과 사파리 저장 공간이 따로지만 클립보드는 같이 쓴다 (lib/transfer.ts)
import { useState } from "react";
import type { AppData } from "@/lib/storage";
import { saveAppData } from "@/lib/storage";
import { decodeTransferCode } from "@/lib/transfer";
import { useInstallEnv, type InstallEnv } from "./useInstall";

interface PasteTransferCardProps {
  /** 개발용 미리보기: 이 상황으로 보여 주고, 저장 대신 이 함수를 부름 */
  previewEnv?: InstallEnv;
  onImport?: (data: AppData) => boolean;
}

const NOT_CODE = "옮기기 코드가 아니에요. 사파리에서 [입력한 값 복사하기]를 다시 눌러 주세요.";

export default function PasteTransferCard({ previewEnv, onImport = saveAppData }: PasteTransferCardProps): React.ReactNode {
  const detected = useInstallEnv();
  const env = previewEnv ?? detected;
  const [manual, setManual] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // 아이폰 홈 화면 앱에서만 (안드로이드는 크롬과 홈 화면 앱이 저장 공간을 같이 써서 필요 없음)
  if (!env || env.context !== "standalone" || !env.ios) return null;

  function tryImport(value: string): void {
    const data = decodeTransferCode(value);
    if (!data) {
      setError(NOT_CODE);
      return;
    }
    if (!onImport(data)) {
      setError("이 기기에서는 저장이 안 돼요.");
      return;
    }
    setError(null);
  }

  async function handlePaste(): Promise<void> {
    try {
      // 아이폰은 여기서 '붙여넣기' 허용 창을 한 번 띄운다
      const value = await navigator.clipboard.readText();
      tryImport(value);
    } catch {
      // 허용을 안 했거나 막히면 직접 붙여넣을 칸
      setManual(true);
      setError(null);
    }
  }

  return (
    <section className="rounded-[10px] border border-ink bg-card px-5 py-4">
      <p className="text-[15px] font-semibold">사파리에서 쓰던 값이 있나요?</p>
      <p className="mt-1 text-xs leading-5 text-sub">
        사파리에서 [입력한 값 복사하기]를 눌렀다면 여기서 붙여넣어요. 처음이면 아래에 바로 입력하면 돼요.
      </p>
      {!manual ? (
        <button
          type="button"
          onClick={() => void handlePaste()}
          className="mt-3 flex h-9 items-center rounded-md bg-btn px-3.5 text-[13px] font-semibold text-white"
        >
          붙여넣기
        </button>
      ) : (
        <>
          <p className="mt-3 text-xs text-sub">아래 칸을 길게 눌러 붙여넣기 해 주세요.</p>
          <textarea
            value={text}
            aria-label="옮기기 코드 붙여넣기"
            placeholder="today-howmuch:…"
            onChange={(e) => {
              setText(e.target.value);
              if (e.target.value.trim() !== "") tryImport(e.target.value);
            }}
            // 16px 미만이면 아이폰이 화면을 확대함
            className="mt-1.5 h-16 w-full resize-none rounded-md border border-line bg-bg p-2 text-base break-all outline-none focus:border-ink"
          />
        </>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger-badge">
          {error}
        </p>
      )}
    </section>
  );
}
