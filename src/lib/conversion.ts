// 환산 — 순수 함수. "≈ 아아 2 · 삼각김밥 2" 같은 문구의 숫자 계산.
import { CONVERSION_ITEMS, type ConversionItem } from "./constants";

export interface ConversionCount {
  label: string;
  /** 오늘 써도 되는 돈으로 살 수 있는 개수 (내림, 0 이상) */
  count: number;
}

export function countAffordable(daily: number, price: number): number {
  if (price <= 0 || daily <= 0) return 0;
  return Math.floor(daily / price);
}

export function convertDaily(
  daily: number,
  items: readonly ConversionItem[] = CONVERSION_ITEMS,
): ConversionCount[] {
  return items.map((item) => ({ label: item.label, count: countAffordable(daily, item.price) }));
}

/**
 * 카드 한 줄 문구: 1개 이상 살 수 있는 품목 중 앞에서 2개. 하나도 못 사면 null(문구 숨김).
 * 예: 20,400원 → "≈ 아아 13 · 삼각김밥 14" / 1,300원 → "≈ 컵라면 1"
 */
export function conversionLine(daily: number, items: readonly ConversionItem[] = CONVERSION_ITEMS): string | null {
  const parts = convertDaily(daily, items)
    .filter((item) => item.count > 0)
    .slice(0, 2)
    .map((item) => `${item.label} ${item.count}`);
  return parts.length === 0 ? null : `≈ ${parts.join(" · ")}`;
}
