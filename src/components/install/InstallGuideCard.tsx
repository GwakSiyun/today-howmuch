// 홈 화면 추가 안내 카드
// - setup: 첫 설정 화면 맨 위. 아이폰·앱 안 브라우저만 (아이폰은 홈 화면 앱 저장 공간이 따로라 입력 "전에" 추가해야 함)
// - main: 메인 화면 맨 아래. 이미 홈 화면 앱이거나 PC면 안 보임
import { useState } from "react";
import { josa } from "@/lib/korean";
import { canShowInstallGuide, shouldGuideBeforeSetup } from "@/lib/platform";
import InstallGuideSheet from "./InstallGuideSheet";
import { readDismissed, useInstallEnv, writeDismissed, type GuideVariant, type InstallEnv } from "./useInstall";

interface InstallGuideCardProps {
  variant: GuideVariant;
  hasData: boolean;
  /** 개발용 미리보기: 기기 판별·닫기 기억을 무시하고 이 상황으로 보여 줌 */
  previewEnv?: InstallEnv;
}

const APP_NAME: Readonly<Record<string, string>> = { instagram: "인스타", kakao: "카톡", inapp: "이 앱" };

export default function InstallGuideCard({ variant, hasData, previewEnv }: InstallGuideCardProps): React.ReactNode {
  const detected = useInstallEnv();
  const env = previewEnv ?? detected;
  const [dismissed, setDismissed] = useState<boolean>(() => (previewEnv ? false : readDismissedSafe(variant)));
  const [open, setOpen] = useState<boolean>(false);

  if (!env || dismissed || !canShowInstallGuide(env.context)) return null;
  if (variant === "setup" && !shouldGuideBeforeSetup(env.context)) return null;

  const browser = env.ios ? "사파리" : "크롬";
  const toBrowser = josa(browser, "으로/로"); // 사파리로 / 크롬으로
  const inApp = APP_NAME[env.context];

  function dismiss(): void {
    if (!previewEnv) writeDismissed(variant);
    setDismissed(true);
  }

  const sheet = open && <InstallGuideSheet env={env} hasData={hasData} onClose={() => setOpen(false)} />;

  if (variant === "setup") {
    const title = inApp ? `${inApp} 안에서 적은 값은 ${toBrowser} 옮겨지지 않아요` : "홈 화면에 먼저 추가하고 시작해요";
    const body = inApp
      ? `${toBrowser} 열어서 홈 화면에 추가한 다음 적어 주세요.`
      : "아이폰은 홈 화면 앱이 따로 저장해서, 여기서 적으면 다시 적어야 해요.";
    return (
      <section className="rounded-[10px] border border-ink bg-card px-5 py-4">
        <p className="text-[15px] font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-sub">{body}</p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-9 items-center rounded-md bg-btn px-3.5 text-[13px] font-semibold text-white"
          >
            {inApp ? `${toBrowser} 여는 법` : "추가하는 법 보기"}
          </button>
          <button type="button" onClick={dismiss} className="min-h-11 text-[13px] text-sub underline underline-offset-2">
            그냥 여기서 쓸게요
          </button>
        </div>
        {sheet}
      </section>
    );
  }

  return (
    <section className="flex items-center justify-between gap-2 rounded-[10px] border border-dashed border-sub/40">
      <button type="button" onClick={() => setOpen(true)} className="min-h-12 flex-1 px-5 py-3 text-left">
        <span className="block text-[13px] font-semibold text-ink">
          {inApp ? `${toBrowser} 열어서 홈 화면에 추가하기 ›` : "홈 화면에 추가하기 ›"}
        </span>
        <span className="mt-0.5 block text-xs text-sub">
          앱처럼 바로 열려요{env.ios && hasData ? " · 추가 후 잔액은 한 번 더 입력해요" : ""}
        </span>
      </button>
      <button type="button" onClick={dismiss} className="min-h-11 shrink-0 px-4 text-xs text-sub">
        닫기
      </button>
      {sheet}
    </section>
  );
}

/** 서버 렌더 중엔 window가 없으므로 false */
function readDismissedSafe(variant: GuideVariant): boolean {
  return typeof window === "undefined" ? false : readDismissed(variant);
}
