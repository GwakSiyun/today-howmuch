// 사파리 → 홈 화면 앱 값 옮기기 (서버·로그인 없이, 복사·붙여넣기) — 순수 함수
// 아이폰은 홈 화면 앱과 사파리가 저장 공간을 따로 쓰지만, 복사·붙여넣기(클립보드)는 같이 쓴다.
// 사파리에서 '옮기기 코드'를 복사 → 홈 화면 앱 첫 설정 화면에서 붙여넣기.
// (2026-11-17 시험: 주소 # 에 담는 방식은 아이폰이 manifest 시작 주소 '/'로 홈 화면 앱을 만들어 실패 → 폐기)
import { parseAppData, type AppData } from "./storage";

const MARKER = "today-howmuch:";

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text); // 고정 지출 이름 등 한글
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string | null {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/** 값 → 클립보드에 넣을 옮기기 코드 */
export function encodeTransferCode(data: AppData): string {
  return `${MARKER}${toBase64Url(JSON.stringify(data))}`;
}

/**
 * 붙여넣은 글 → 값. 앞뒤 다른 글자·줄바꿈이 섞여 있어도 코드 부분만 찾는다.
 * 코드가 없거나 형식이 틀리면 null (parseAppData로 검증)
 */
export function decodeTransferCode(text: string): AppData | null {
  const match = text.match(/today-howmuch:([A-Za-z0-9_-]+)/);
  if (!match) return null;
  return parseAppData(fromBase64Url(match[1]));
}
