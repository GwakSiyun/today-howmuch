// 한글 조사 — 앞 글자 받침에 맞춰 붙인다. (예: 사파리로 / 크롬으로, 사파리가 / 크롬이)

export type JosaPair = "이/가" | "을/를" | "은/는" | "으로/로";

/** 마지막 글자 받침(종성) 번호. 받침 없음 0, 한글이 아니면 null */
function finalConsonant(word: string): number | null {
  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0) - 0xac00;
  if (Number.isNaN(code) || code < 0 || code > 11171) return null;
  return code % 28;
}

const RIEUL = 8; // ㄹ 받침

/** 단어 + 알맞은 조사. 한글이 아니면(영문 등) 받침 없는 쪽으로 붙인다 */
export function josa(word: string, pair: JosaPair): string {
  const jong = finalConsonant(word) ?? 0;
  const [withFinal, withoutFinal] = pair.split("/") as [string, string];
  if (pair === "으로/로") {
    // ㄹ 받침은 '로' (서울로, 길로)
    return word + (jong === 0 || jong === RIEUL ? withoutFinal : withFinal);
  }
  return word + (jong === 0 ? withoutFinal : withFinal);
}
