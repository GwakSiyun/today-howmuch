// 사파리 → 홈 화면 앱 값 옮기기 (서버·로그인 없이) — 순수 함수
// 아이폰은 홈 화면 앱과 사파리가 저장 공간을 따로 쓴다. 홈 화면 추가 안내가 열려 있는 동안
// 주소 # 뒤에 값을 담아 두고, 홈 화면 앱이 그 주소로 처음 열리면 읽어서 저장한다.
// ⚠️ 시험 중: 아이폰이 홈 화면 앱 시작 주소로 '지금 주소'를 쓰는지(# 포함) 실기기 확인 필요.
// # 뒤는 서버로 전송되지 않는다. 분석 기록에서도 뺀다(source.ts analyticsUrl).
import { parseAppData, type AppData } from "./storage";

export const IMPORT_KEY = "import";

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

/** 값 → 주소 # 뒤에 붙일 문자열 ("import=…") */
export function encodeTransferHash(data: AppData): string {
  return `${IMPORT_KEY}=${toBase64Url(JSON.stringify(data))}`;
}

/** 주소 # 부분("#import=…" 또는 "import=…") → 값. 형식이 틀리면 null (parseAppData로 검증) */
export function decodeTransferHash(hash: string): AppData | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const value = params.get(IMPORT_KEY);
  if (!value) return null;
  return parseAppData(fromBase64Url(value));
}

/** 주소에서 # 부분을 뺀 것 */
export function stripHash(url: string): string {
  const index = url.indexOf("#");
  return index === -1 ? url : url.slice(0, index);
}
