// 상태(여유/빠듯/위험) 판정 — 순수 함수.
import { STATUS_THRESHOLDS, type BudgetStatus, type StatusThresholds } from "./constants";

export function getBudgetStatus(
  daily: number,
  thresholds: Readonly<StatusThresholds> = STATUS_THRESHOLDS,
): BudgetStatus {
  if (daily >= thresholds.relaxedMin) return "relaxed";
  if (daily >= thresholds.tightMin) return "tight";
  return "danger";
}
