// 날짜 갱신용 — 순수 함수

/** 다음 로컬 자정까지 남은 ms (자정 직후 확실히 넘어가도록 +1초) */
export function msUntilNextMidnight(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime() + 1_000;
}
