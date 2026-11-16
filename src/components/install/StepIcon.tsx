// 안내 단계 옆 작은 버튼 모양 (실제 사파리·크롬 버튼과 비슷하게)
export type StepIconKind = "share" | "more" | "plus" | "dots" | "kebab" | "compass";

const PATHS: Readonly<Record<StepIconKind, React.ReactNode>> = {
  // 네모에서 화살표가 위로 나온 공유 버튼
  share: (
    <>
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M8 11H6v9h12v-9h-2" />
    </>
  ),
  // 동그라미 안 ∨ (더 보기)
  more: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 10.5l4 4 4-4" />
    </>
  ),
  // 네모 안 + (홈 화면에 추가)
  plus: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  dots: (
    <>
      <circle cx="6" cy="12" r="1.3" fill="currentColor" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      <circle cx="18" cy="12" r="1.3" fill="currentColor" />
    </>
  ),
  kebab: (
    <>
      <circle cx="12" cy="6" r="1.3" fill="currentColor" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      <circle cx="12" cy="18" r="1.3" fill="currentColor" />
    </>
  ),
  // 나침반 (사파리로 열기)
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
};

export default function StepIcon({ kind }: { kind: StepIconKind }): React.ReactNode {
  return (
    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-[5px] border border-line text-btn">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="15"
        height="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {PATHS[kind]}
      </svg>
    </span>
  );
}
