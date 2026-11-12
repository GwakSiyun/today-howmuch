"use client";

// ⚠️ 개발용 미리보기 — 예시 데이터. 기기 저장소(localStorage)는 읽지도 쓰지도 않는다.
import { useState, useSyncExternalStore } from "react";
import MainScreen from "@/components/main/MainScreen";
import { toDateKey } from "@/lib/payday";
import type { AppData, BalanceEntry } from "@/lib/storage";

type ScenarioKey = "relaxed" | "tight" | "danger" | "minus" | "stale" | "single";

const SCENARIO_LABEL: Readonly<Record<ScenarioKey, string>> = {
  relaxed: "여유",
  tight: "빠듯",
  danger: "위험+고정지출",
  minus: "마이너스",
  stale: "3일 전 입력",
  single: "입력 1번",
};

function daysAgo(now: Date, n: number): string {
  return toDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - n));
}

/** [며칠 전, 잔액] 목록 → 기록 */
function entries(now: Date, list: ReadonlyArray<readonly [number, number]>): BalanceEntry[] {
  return list.map(([ago, balance]) => ({ date: daysAgo(now, ago), balance }));
}

function buildScenario(key: ScenarioKey, now: Date): AppData {
  const base: AppData["settings"] = { payDay: 25, earlyOnDayOff: true, useFixedExpenses: false, fixedExpenses: [] };
  const history = (last: number): BalanceEntry[] =>
    entries(now, [
      [9, last + 75_000],
      [6, last + 45_000],
      [3, last + 20_000],
      [0, last],
    ]);

  switch (key) {
    case "relaxed":
      return { version: 1, settings: base, balances: history(265_000) };
    case "tight":
      return { version: 1, settings: base, balances: history(150_000) };
    case "danger":
      return {
        version: 1,
        settings: {
          ...base,
          useFixedExpenses: true,
          fixedExpenses: [
            { id: "rent", name: "월세", amount: 50_000, paidFor: null },
            { id: "phone", name: "통신비", amount: 33_000, paidFor: null },
          ],
        },
        balances: history(160_000),
      };
    case "minus":
      return {
        version: 1,
        settings: {
          ...base,
          useFixedExpenses: true,
          fixedExpenses: [{ id: "rent", name: "월세", amount: 56_000, paidFor: null }],
        },
        balances: history(30_000),
      };
    case "stale":
      return {
        version: 1,
        settings: base,
        balances: entries(now, [
          [10, 330_000],
          [6, 300_000],
          [3, 265_000],
        ]),
      };
    case "single":
      return { version: 1, settings: base, balances: entries(now, [[0, 265_000]]) };
  }
}

function subscribeNothing(): () => void {
  return () => {};
}

export default function PreviewClient(): React.ReactNode {
  // 서버 렌더 중에는 날짜를 만들지 않음 (하이드레이션 불일치 방지)
  const mounted = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const [scenario, setScenario] = useState<ScenarioKey>("relaxed");
  // 시나리오별로 바텀시트·나갔어요를 눌러 본 결과를 메모리에만 들고 있음
  const [edited, setEdited] = useState<Partial<Record<ScenarioKey, AppData>>>({});

  if (!mounted) return <div aria-busy="true" className="min-h-[60vh]" />;

  const now = new Date();
  const data = edited[scenario] ?? buildScenario(scenario, now);
  const save = (next: AppData): boolean => {
    setEdited((prev) => ({ ...prev, [scenario]: next }));
    return true;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-dashed border-sub/50 p-2">
        <p className="px-1 pb-1.5 text-[11px] text-sub">개발용 미리보기 · 예시 데이터 · 기기에 저장 안 됨</p>
        <div className="flex flex-wrap gap-1">
          {(Object.keys(SCENARIO_LABEL) as ScenarioKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setScenario(key)}
              className={`h-8 rounded-md px-2.5 text-xs ${
                key === scenario ? "bg-btn text-white" : "border border-line bg-card text-sub"
              }`}
            >
              {SCENARIO_LABEL[key]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setEdited({})}
            className="h-8 rounded-md border border-line bg-card px-2.5 text-xs text-sub"
          >
            초기화
          </button>
        </div>
      </div>

      <MainScreen key={scenario} data={data} save={save} now={now} />
    </div>
  );
}
