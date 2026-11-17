// 홈 화면에 추가하는 법 — 들어온 곳(아이폰 사파리·안드로이드 크롬·인스타·카톡·유튜브)에 맞춘 단계
import { useEffect, useState } from "react";
import { josa } from "@/lib/korean";
import { needsYoutubeHint } from "@/lib/platform";
import type { AppData } from "@/lib/storage";
import { encodeTransferHash, stripHash } from "@/lib/transfer";
import BottomSheet from "../BottomSheet";
import StepIcon, { type StepIconKind } from "./StepIcon";
import { promptInstall, useCanPromptInstall, type InstallEnv } from "./useInstall";

interface Step {
  text: React.ReactNode;
  hints?: string[];
  icon?: StepIconKind;
}

interface Guide {
  title: string;
  subtitle: string;
  steps: Step[];
  /** 앱 밖 브라우저로 넘기는 버튼 (카톡·안드로이드 앱 안) */
  externalLink?: { label: string; href: string };
  /** 주소 복사 버튼 */
  copyUrl?: boolean;
}

const B = ({ children }: { children: React.ReactNode }): React.ReactNode => (
  <b className="font-semibold">{children}</b>
);

const IOS_SAFARI_STEPS: Step[] = [
  {
    text: (
      <>
        화면 맨 아래 가운데 <B>공유 버튼</B>을 눌러요
      </>
    ),
    icon: "share",
    hints: ["네모에서 화살표가 위로 나온 모양", "아래 막대가 안 보이면 화면을 살짝 위로 올려요"],
  },
  {
    text: (
      <>
        둘째 줄 오른쪽 끝 <B>더 보기</B>를 눌러요
      </>
    ),
    icon: "more",
    hints: ["복사 · 북마크 · 읽기 목록 옆 동그란 버튼", "더 보기가 없으면 공유 창을 아래로 내려요"],
  },
  {
    text: (
      <>
        <B>홈 화면에 추가</B>를 눌러요
      </>
    ),
    icon: "plus",
    hints: ["즐겨찾기 · 페이지에서 찾기 아래에 있어요"],
  },
  { text: <>오른쪽 위 <B>추가</B>를 누르면 끝</>, hints: ["이름이 '오늘얼마'인지 확인해요"] },
];

const ANDROID_CHROME_STEPS: Step[] = [
  { text: <>오른쪽 위 <B>⋮</B> 메뉴를 눌러요</>, icon: "kebab" },
  { text: <><B>홈 화면에 추가</B>를 눌러요</>, icon: "plus", hints: ["폰에 따라 '앱 설치'로 보여요"] },
  { text: <><B>추가</B>(또는 <B>설치</B>)를 누르면 끝</> },
];

export function buildGuide(env: InstallEnv, url: string): Guide {
  const browser = env.ios ? "사파리" : "크롬";
  // 조사는 받침에 맞춰: 사파리로/크롬으로, 사파리가/크롬이
  const toBrowser = josa(browser, "으로/로");
  const browserSubject = josa(browser, "이/가");
  const youtubeStep: Step[] = needsYoutubeHint(env.context, env.source)
    ? [
        {
          text: env.ios ? (
            <>
              유튜브에서 눌러 들어왔다면 먼저 오른쪽 아래 <B>나침반 버튼</B>으로 사파리에서 열어요
            </>
          ) : (
            <>
              유튜브에서 눌러 들어왔다면 먼저 오른쪽 위 <B>⋮ → Chrome에서 열기</B>를 눌러요
            </>
          ),
          icon: env.ios ? "compass" : "kebab",
          hints: [`이미 ${browser} 화면이면 이 단계는 건너뛰어요`],
        },
      ]
    : [];

  switch (env.context) {
    case "ios-safari":
      return {
        title: "홈 화면에 추가하는 법",
        subtitle: "한 번만 하면 다음부터 앱처럼 바로 열려요",
        steps: [...youtubeStep, ...IOS_SAFARI_STEPS],
      };
    case "android-chrome":
      return {
        title: "홈 화면에 추가하는 법",
        subtitle: "한 번만 하면 다음부터 앱처럼 바로 열려요",
        steps: [...youtubeStep, ...ANDROID_CHROME_STEPS],
      };
    case "ios-other":
      return {
        title: "사파리에서 추가할 수 있어요",
        subtitle: "아이폰은 사파리에서 홈 화면에 추가하는 게 가장 확실해요",
        copyUrl: true,
        steps: [
          { text: <>아래 <B>주소 복사하기</B>를 눌러요</> },
          { text: <><B>사파리</B>를 열고 주소창에 붙여넣어요</>, icon: "compass" },
          ...IOS_SAFARI_STEPS,
        ],
      };
    case "instagram":
      return {
        title: "인스타 안에서는 홈 화면에 추가가 안 돼요",
        subtitle: `${toBrowser} 연 다음 추가해 주세요`,
        copyUrl: true,
        externalLink: env.ios ? undefined : { label: "크롬으로 열기", href: chromeIntent(url) },
        steps: env.ios
          ? [
              { text: <>오른쪽 위 <B>⋯</B>을 눌러요</>, icon: "dots" },
              {
                text: <><B>외부 브라우저에서 열기</B>를 눌러요</>,
                icon: "compass",
                hints: ["'Safari에서 열기'로 보일 수도 있어요", "메뉴가 없으면 주소를 복사해서 사파리에 붙여넣어요"],
              },
              { text: <>사파리가 열리면 화면 위 안내를 다시 눌러요</> },
            ]
          : [
              { text: <>아래 <B>크롬으로 열기</B>를 눌러요</>, hints: ["안 되면 오른쪽 위 ⋮ → '외부 브라우저로 열기'"] },
              { text: <>크롬이 열리면 화면 위 안내를 다시 눌러요</> },
            ],
      };
    case "kakao":
      return {
        title: "카톡 안에서는 홈 화면에 추가가 안 돼요",
        subtitle: `${toBrowser} 연 다음 추가해 주세요`,
        copyUrl: true,
        externalLink: { label: `${toBrowser} 열기`, href: `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}` },
        steps: [
          { text: <>아래 <B>{toBrowser} 열기</B>를 눌러요</>, hints: ["안 되면 카톡 화면의 ⋯ 또는 ⋮ 메뉴 → '다른 브라우저로 열기'"] },
          { text: <>{browserSubject} 열리면 화면 위 안내를 다시 눌러요</> },
        ],
      };
    case "inapp":
      return {
        title: "이 앱 안에서는 홈 화면에 추가가 안 돼요",
        subtitle: `${toBrowser} 연 다음 추가해 주세요`,
        copyUrl: true,
        externalLink: env.ios ? undefined : { label: "크롬으로 열기", href: chromeIntent(url) },
        steps: [
          { text: <>앱 메뉴(<B>⋯</B> 또는 <B>⋮</B>)에서 <B>브라우저로 열기</B>를 찾아요</>, icon: "dots" },
          { text: <>메뉴가 없으면 주소를 복사해서 {browser}에 붙여넣어요</> },
        ],
      };
    case "android-other":
      return {
        title: "홈 화면에 추가하는 법",
        subtitle: "크롬에서 열면 버튼 한 번으로 추가돼요",
        copyUrl: true,
        externalLink: { label: "크롬으로 열기", href: chromeIntent(url) },
        steps: [
          { text: <>브라우저 메뉴(<B>≡</B> 또는 <B>⋮</B>)를 눌러요</>, icon: "kebab" },
          { text: <><B>홈 화면에 추가</B>를 찾아 눌러요</>, icon: "plus", hints: ["삼성 인터넷은 '현재 페이지 추가 → 홈 화면'"] },
        ],
      };
    default:
      return { title: "홈 화면에 추가하는 법", subtitle: "", steps: [] };
  }
}

/** 안드로이드 앱 안 브라우저 → 크롬으로 열기 */
function chromeIntent(url: string): string {
  const { host, pathname } = new URL(url);
  return `intent://${host}${pathname}#Intent;scheme=https;package=com.android.chrome;end`;
}

interface InstallGuideSheetProps {
  env: InstallEnv;
  /** 이미 입력한 데이터가 있는지 — 아이폰은 홈 화면 앱에서 다시 입력해야 함을 알림 */
  hasData: boolean;
  /** 아이폰 사파리에서 홈 화면 앱으로 옮겨 볼 값 (미리보기에선 안 넘김 → 주소 안 건드림) */
  transferData?: AppData;
  onClose: () => void;
}

export default function InstallGuideSheet({ env, hasData, transferData, onClose }: InstallGuideSheetProps): React.ReactNode {
  // ⚠️ 시험 중: 시트가 열려 있는 동안만 주소 # 뒤에 값을 담아 둔다.
  // 아이폰이 이 주소로 홈 화면 앱을 만들면, 앱 첫 실행 때 HomeApp이 읽어서 저장한다.
  // 시트를 닫으면 바로 지운다 (주소를 공유해도 값이 따라가지 않게).
  const transfer = env.context === "ios-safari" ? transferData : undefined;
  useEffect(() => {
    if (!transfer) return;
    try {
      window.history.replaceState(window.history.state, "", `${stripHash(window.location.href)}#${encodeTransferHash(transfer)}`);
    } catch {
      return;
    }
    return () => {
      try {
        window.history.replaceState(window.history.state, "", stripHash(window.location.href));
      } catch {
        // 주소를 못 바꿔도 앱 동작엔 영향 없음
      }
    };
  }, [transfer]);

  // 복사·외부로 열기는 출처(?from=)를 빼고 첫 화면으로 — 같은 방문이 두 번 집계되지 않게
  const url = `${window.location.origin}/`;
  const guide = buildGuide(env, url);
  const canPrompt = useCanPromptInstall();
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  const oneTap = env.context === "android-chrome" && canPrompt;

  async function handleSubmit(): Promise<void> {
    if (oneTap) {
      await promptInstall();
    }
    onClose();
  }

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
      setCopied("done");
    } catch {
      // 앱 안 브라우저는 복사가 막히기도 함 → 주소를 보여 줘서 길게 눌러 복사하게
      setCopied("failed");
    }
  }

  return (
    <BottomSheet
      title={guide.title}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      error={null}
      submitLabel={oneTap ? "홈 화면에 추가" : "알겠어요"}
    >
      <p className="mt-0.5 text-xs text-sub">{guide.subtitle}</p>

      {oneTap && (
        <p className="mt-3 rounded-md bg-bg px-3 py-2.5 text-[13px]">
          아래 <B>홈 화면에 추가</B>를 누르면 크롬 창이 떠요. 거기서 <B>설치</B>만 누르면 끝이에요.
        </p>
      )}

      {!oneTap && guide.steps.length > 0 && (
        <ol className="mt-4 flex flex-col gap-3">
          {guide.steps.map((step, index) => (
            <li key={index} className="flex gap-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-[4px] bg-btn text-xs text-white tabular-nums">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] leading-5">{step.text}</p>
                {(step.icon || step.hints) && (
                  <div className="mt-1 flex items-start gap-2 text-xs text-sub">
                    {step.icon && <StepIcon kind={step.icon} />}
                    {step.hints && (
                      <div className="flex flex-col gap-0.5 pt-0.5">
                        {step.hints.map((hint) => (
                          <span key={hint}>{hint}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {(guide.externalLink || guide.copyUrl) && (
        <div className="mt-4 flex gap-2">
          {guide.externalLink && (
            <a
              href={guide.externalLink.href}
              className="flex h-10 flex-1 items-center justify-center rounded-md bg-btn text-[13px] font-semibold text-white"
            >
              {guide.externalLink.label}
            </a>
          )}
          {guide.copyUrl && (
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="h-10 flex-1 rounded-md border border-line text-[13px]"
            >
              {copied === "done" ? "복사했어요" : "주소 복사하기"}
            </button>
          )}
        </div>
      )}
      {copied === "failed" && (
        <p className="mt-2 text-xs text-sub">
          복사가 막혔어요. 이 주소를 길게 눌러 복사해 주세요: <span className="font-semibold text-ink select-all">{url}</span>
        </p>
      )}

      {env.ios && (
        <p className="mt-4 rounded-md bg-bg px-3 py-2.5 text-xs leading-5 text-sub">
          아이폰은 홈 화면 앱이 사파리와 따로 저장해요. 추가한 다음엔 <B>홈 화면 아이콘으로 열어서</B> 써 주세요.
          {hasData &&
            (transfer
              ? " 지금 적어 둔 값은 홈 화면 앱으로 옮겨 볼게요. 안 옮겨졌으면 한 번 더 입력해 주세요."
              : " 이미 적은 월급날·잔액은 홈 화면 앱에서 한 번 더 입력해야 해요.")}
          {env.context === "ios-safari" && (
            <>
              {" "}
              사파리에서만 쓰면 <B>7일 동안 안 열었을 때 기록이 지워질 수 있어요</B>. 홈 화면 앱은 괜찮아요.
            </>
          )}
        </p>
      )}
    </BottomSheet>
  );
}
