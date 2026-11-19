import "server-only";

import { neon } from "@neondatabase/serverless";
import type { FeedbackSource } from "./feedbackSource";

/**
 * 의견 저장 — 막차 계산기와 같은 "만듦 사이트 공용" Neon Postgres의 feedback 테이블 (site 칸으로 구분).
 * 접속 정보는 Vercel이 연결해 준 DATABASE_URL — 서버 전용. 테이블 정의는 막차 계산기 db/feedback.sql.
 * ⚠️ 이 앱의 유일한 서버 저장. 월급날·잔액 같은 사용자 데이터는 보내지 않고, 의견 칸에 직접 쓴 글·연락처만.
 */

export const SITE_ID = "today-howmuch";
export const MAX_MESSAGE = 1000;
export const MAX_CONTACT = 100;

export interface FeedbackInput {
  message: string;
  contact: string | null;
  source: FeedbackSource;
}

export function hasFeedbackDb(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function saveFeedback(input: FeedbackInput): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL 이 설정되지 않았어요.");
  const sql = neon(url);
  await sql`insert into feedback (site, message, contact, source)
            values (${SITE_ID}, ${input.message}, ${input.contact}, ${input.source})`;
}
