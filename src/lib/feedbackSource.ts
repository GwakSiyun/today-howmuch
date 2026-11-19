// 의견이 어디서 들어온 사람의 것인지 — 순수 함수 (막차 계산기와 같은 값 + 홈 화면 앱 'app')
import { sourceFromUrl } from "./source";

export const FEEDBACK_SOURCES = ["youtube", "instagram", "naver", "google", "app", "direct", "other"] as const;
export type FeedbackSource = (typeof FEEDBACK_SOURCES)[number];

export function toFeedbackSource(value: string): FeedbackSource {
  return FEEDBACK_SOURCES.find((source) => source === value) ?? "other";
}

export interface SourceInput {
  /** 처음 들어온 주소 */
  url: string;
  referrer: string;
  /** 홈 화면 앱으로 열었는지 */
  standalone: boolean;
}

/** 우선순위: ?from= (인스타·유튜브 링크) → 홈 화면 앱 → 어디서 왔는지(referrer) */
export function detectFeedbackSource(input: SourceInput): FeedbackSource {
  const from = sourceFromUrl(input.url);
  if (from) return from;
  if (input.standalone) return "app";

  let host = "";
  let selfHost = "";
  try {
    selfHost = new URL(input.url).hostname;
    host = input.referrer ? new URL(input.referrer).hostname : "";
  } catch {
    return "other";
  }
  if (!host || host === selfHost) return "direct";
  if (host.includes("naver")) return "naver";
  if (host.includes("google")) return "google";
  if (host.includes("youtube") || host === "youtu.be") return "youtube";
  if (host.includes("instagram")) return "instagram";
  return "other";
}
