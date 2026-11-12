// 앱 기준값 모음 (SPEC.md §5)

export type BudgetStatus = "relaxed" | "tight" | "danger";

export const STATUS_LABEL: Readonly<Record<BudgetStatus, string>> = {
  relaxed: "여유",
  tight: "빠듯",
  danger: "위험",
};

/** 하루 써도 되는 돈(원) 기준 */
export interface StatusThresholds {
  /** 이 금액 이상 → 여유 */
  relaxedMin: number;
  /** 이 금액 이상 → 빠듯, 미만(마이너스 포함) → 위험 */
  tightMin: number;
}

/** ✅ 확정 2026-11-12 (A. 고정 금액): 2만 원 이상 여유 · 1만~2만 원 빠듯 · 1만 원 미만 위험 */
export const STATUS_THRESHOLDS: Readonly<StatusThresholds> = {
  relaxedMin: 20_000,
  tightMin: 10_000,
};

export interface ConversionItem {
  label: string;
  /** 대표 가격(원). 편의점·제품마다 달라서 화면엔 "≈"를 붙인다 */
  price: number;
}

/**
 * ✅ 확정 2026-11-12 — 천원대 편의점 단골템 대표 가격 (조사 근거: SPEC.md §5 Q2)
 * - 아아: 편의점 원두 아이스 1,300~2,100원 → 1,500원
 * - 삼각김밥: 기본 1,100원대~1,400원 → 1,400원
 * - 컵라면: 육개장사발면 1,200원 (농심 2026-08-01 인상)
 * 부풀려 보이지 않게 범위 안에서 낮지 않은 값으로 잡음. 물가 바뀌면 여기만 고친다.
 */
export const CONVERSION_ITEMS: readonly ConversionItem[] = [
  { label: "아아", price: 1_500 },
  { label: "삼각김밥", price: 1_400 },
  { label: "컵라면", price: 1_200 },
];
