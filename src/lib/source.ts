// 유입 경로 측정 — 순수 함수.
// Vercel 무료 플랜은 커스텀 이벤트·UTM 집계가 안 돼서(Pro 전용, 2026-11-16 문서 확인),
// ?from=instagram 으로 들어온 페이지뷰를 가상 경로 /from/instagram 으로 바꿔 기록한다.
// → 대시보드 Pages 에서 출처별 방문 수가 따로 보임. 실제 화면 주소는 바뀌지 않는다.

export const KNOWN_SOURCES = ["instagram", "youtube"] as const;
export type Source = (typeof KNOWN_SOURCES)[number];

function isSource(value: string): value is Source {
  return (KNOWN_SOURCES as readonly string[]).includes(value);
}

/** 주소에서 알려진 출처만 꺼냄. 모르는 값·없음·깨진 주소는 null */
export function sourceFromUrl(url: string): Source | null {
  try {
    const from = new URL(url).searchParams.get("from")?.trim().toLowerCase() ?? "";
    return isSource(from) ? from : null;
  } catch {
    return null;
  }
}

/** 출처가 있으면 같은 도메인의 /from/{출처} 로, 없으면 그대로 */
export function analyticsUrl(url: string): string {
  const source = sourceFromUrl(url);
  if (source === null) return url;
  return `${new URL(url).origin}/from/${source}`;
}
