// 의견 보내기 바텀시트 — 막차 계산기와 같은 공용 의견 테이블에 저장 (서버 액션)
// 월급날·잔액 같은 기기 데이터는 보내지 않는다. 이 칸에 직접 쓴 글·연락처만.
import { useRef, useState } from "react";
import { sendFeedbackAction } from "@/app/feedbackAction";
import { detectFeedbackSource } from "@/lib/feedbackSource";
import BottomSheet from "../BottomSheet";

interface FeedbackSheetProps {
  onClose: () => void;
}

const MAX_MESSAGE = 1000;
const MAX_CONTACT = 100;
// 16px 미만이면 아이폰이 화면을 확대함
const fieldClass = "w-full rounded-md border border-line bg-card px-3 text-base text-ink outline-none focus:border-ink";

function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  try {
    return nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  } catch {
    return nav.standalone === true;
  }
}

export default function FeedbackSheet({ onClose }: FeedbackSheetProps): React.ReactNode {
  const [message, setMessage] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // 봇 걸러내기용 — 사람에겐 안 보이는 칸
  const honeypot = useRef<HTMLInputElement>(null);

  async function handleSubmit(): Promise<void> {
    if (sent) {
      onClose();
      return;
    }
    if (message.trim() === "") {
      setError("의견을 적어 주세요.");
      return;
    }
    const formData = new FormData();
    formData.set("message", message);
    formData.set("contact", contact);
    formData.set("website", honeypot.current?.value ?? "");
    formData.set(
      "source",
      detectFeedbackSource({ url: window.location.href, referrer: document.referrer, standalone: isStandalone() }),
    );

    setSending(true);
    setError(null);
    try {
      const result = await sendFeedbackAction({ status: "idle" }, formData);
      if (result.status === "sent") setSent(true);
      else if (result.status === "error") setError(result.message);
    } catch {
      setError("보내지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <BottomSheet title="의견 보내기" onClose={onClose} onSubmit={() => void handleSubmit()} error={null} submitLabel="닫기">
        <p className="mt-4 text-sm leading-6">
          고마워요! 보내 주신 의견은 꼼꼼히 읽고
          <br />
          다음 업데이트에 반영할게요.
        </p>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      title="의견 보내기"
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      error={error}
      submitLabel={sending ? "보내는 중…" : "보내기"}
      submitting={sending}
    >
      <p className="mt-0.5 text-xs text-sub">써 보면서 불편했던 점이나 있었으면 하는 기능을 알려 주세요.</p>

      <label className="mt-4 block text-[13px] text-sub">
        불편했던 점 · 바라는 기능
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX_MESSAGE}
          rows={4}
          placeholder="예) 월급날이 두 번인 사람도 쓸 수 있으면 좋겠어요"
          className={`${fieldClass} mt-1.5 resize-none py-2.5 leading-6`}
        />
      </label>

      <label className="mt-3 block text-[13px] text-sub">
        연락처 <span className="text-sub/70">(선택 · 답장이 필요하면)</span>
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          maxLength={MAX_CONTACT}
          placeholder="이메일 또는 인스타 아이디"
          className={`${fieldClass} mt-1.5 h-11`}
        />
      </label>

      <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <p className="mt-3 text-[11px] leading-5 text-sub">
        이 칸에 적은 글과 연락처만 보내져요. 월급날·잔액은 지금처럼 이 기기에만 있어요.
      </p>
    </BottomSheet>
  );
}
