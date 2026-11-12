const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** 1234567 → "1,234,567" */
export function formatWon(value: number): string {
  return value.toLocaleString("ko-KR");
}

/** 11.12 목 */
export function formatHeaderDate(date: Date): string {
  return `${date.getMonth() + 1}.${date.getDate()} ${WEEKDAYS[date.getDay()]}`;
}

/** 11/25 */
export function formatShortDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/** 입력창 문자열에서 숫자만 남겨 정수로. 비었으면 null */
export function parseWonInput(text: string): number | null {
  const digits = text.replace(/[^\d]/g, "");
  if (digits === "") return null;
  const value = Number(digits);
  return Number.isSafeInteger(value) ? value : null;
}

/** 입력 중 표시용: 숫자만 남기고 콤마 */
export function toWonText(text: string): string {
  const value = parseWonInput(text);
  return value === null ? "" : formatWon(value);
}

/** 하루 금액 변화: -1200 → "-1,200원", 1200 → "+1,200원" */
export function formatSignedWon(value: number): string {
  return `${value > 0 ? "+" : ""}${formatWon(value)}원`;
}
