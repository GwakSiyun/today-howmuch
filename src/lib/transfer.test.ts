import { describe, expect, it } from "vitest";
import type { AppData } from "./storage";
import { decodeTransferCode, encodeTransferCode } from "./transfer";

const data: AppData = {
  version: 1,
  settings: {
    payDay: 25,
    earlyOnDayOff: true,
    useFixedExpenses: true,
    fixedExpenses: [{ id: "a", name: "월세 🏠", amount: 400_000, paidFor: "2026-11-25" }],
  },
  balances: [
    { date: "2026-11-12", balance: 300_000 },
    { date: "2026-11-16", balance: 265_000 },
  ],
};

describe("옮기기 코드 (복사·붙여넣기)", () => {
  it("복사했다가 그대로 붙여넣음 (한글·이모지 포함)", () => {
    const code = encodeTransferCode(data);
    expect(code).toMatch(/^today-howmuch:[A-Za-z0-9_-]+$/);
    expect(decodeTransferCode(code)).toEqual(data);
  });

  it("앞뒤 공백·줄바꿈·다른 글이 섞여도 코드만 찾음", () => {
    const code = encodeTransferCode(data);
    expect(decodeTransferCode(`  \n${code}\n `)).toEqual(data);
    expect(decodeTransferCode(`오늘얼마 옮기기 코드 ${code} 끝`)).toEqual(data);
  });

  it("코드가 아니거나 깨졌거나 형식이 틀리면 null", () => {
    expect(decodeTransferCode("")).toBeNull();
    expect(decodeTransferCode("아무 글자")).toBeNull();
    expect(decodeTransferCode("today-howmuch:@@@")).toBeNull();
    const broken = encodeTransferCode({ ...data, settings: { ...data.settings, payDay: 99 } });
    expect(decodeTransferCode(broken)).toBeNull();
  });
});
