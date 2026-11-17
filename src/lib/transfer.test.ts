import { describe, expect, it } from "vitest";
import type { AppData } from "./storage";
import { decodeTransferHash, encodeTransferHash, stripHash } from "./transfer";

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

describe("사파리 → 홈 화면 앱 값 옮기기", () => {
  it("담았다가 그대로 꺼냄 (한글·이모지 포함)", () => {
    const hash = encodeTransferHash(data);
    expect(hash.startsWith("import=")).toBe(true);
    expect(decodeTransferHash(`#${hash}`)).toEqual(data);
  });

  it("주소에 쓸 수 있는 글자만 (+ / = 없음)", () => {
    expect(encodeTransferHash(data)).toMatch(/^import=[A-Za-z0-9_-]+$/);
  });

  it("없거나 깨졌거나 형식이 틀리면 null", () => {
    expect(decodeTransferHash("")).toBeNull();
    expect(decodeTransferHash("#import=@@@")).toBeNull();
    expect(decodeTransferHash("#other=1")).toBeNull();
    const broken = encodeTransferHash({ ...data, settings: { ...data.settings, payDay: 99 } });
    expect(decodeTransferHash(broken)).toBeNull();
  });

  it("stripHash", () => {
    expect(stripHash("https://a.app/?from=instagram#import=xyz")).toBe("https://a.app/?from=instagram");
    expect(stripHash("https://a.app/")).toBe("https://a.app/");
  });
});
