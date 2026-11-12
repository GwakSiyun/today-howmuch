// ⚠️ 임시 결과 화면 (11/16) — 계산이 맞게 나오는지 보기 위한 최소 표시.
// 11/18 메인 화면 디자인(상태색·배지·잔액/월급날/지난번 카드)으로 교체 예정.
// 상태 배지·환산 문구는 기준값 미정(SPEC Q1·Q2)이라 아직 렌더하지 않는다.
// 고정 지출 "나갔어요" 목록의 메인 화면 배치도 미정 — 여기선 동작 확인용.
import { calcDailyBudget, isPaidThisCycle, togglePaid } from "@/lib/budget";
import { formatHeaderDate, formatShortDate, formatWon } from "@/lib/format";
import { saveAppData, type AppData } from "@/lib/storage";

interface InterimResultProps {
  data: AppData;
}

export default function InterimResult({ data }: InterimResultProps): React.ReactNode {
  const today = new Date();
  const latest = data.balances[data.balances.length - 1];
  const { settings } = data;
  const budget = calcDailyBudget({
    balance: latest.balance,
    fixedExpenses: settings.useFixedExpenses ? settings.fixedExpenses : [],
    today,
    rule: { payDay: settings.payDay, earlyOnDayOff: settings.earlyOnDayOff },
  });

  function handleTogglePaid(id: string): void {
    // 저장 실패해도 화면은 그대로(이전 값) — 거짓 성공 표시 안 함
    saveAppData({
      ...data,
      settings: {
        ...settings,
        fixedExpenses: togglePaid(settings.fixedExpenses, id, budget.cycleKey),
      },
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-baseline justify-between pb-2">
        <h1 className="text-lg font-bold">오늘얼마</h1>
        <span className="text-sm text-sub">{formatHeaderDate(today)}</span>
      </header>

      <section className="rounded-[10px] bg-card p-5">
        <p className="text-sm text-sub">오늘 써도 되는 돈</p>
        <p className="mt-1 text-[42px] leading-tight font-bold tabular-nums text-ink">
          {formatWon(budget.daily)}
          <span className="ml-0.5 text-lg font-semibold">원</span>
        </p>
      </section>

      <section className="rounded-[10px] bg-card p-5 text-sm">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
          <dt className="text-sub">남은 잔액</dt>
          <dd className="text-right tabular-nums">{formatWon(latest.balance)}원</dd>
          {settings.useFixedExpenses && (
            <>
              <dt className="text-sub">아직 안 나간 고정 지출</dt>
              <dd className="text-right tabular-nums">−{formatWon(budget.fixedTotal)}원</dd>
            </>
          )}
          <dt className="text-sub">월급날까지</dt>
          <dd className="text-right tabular-nums">
            {budget.daysLeft}일 · {formatShortDate(budget.payday)}
          </dd>
        </dl>
      </section>

      {settings.useFixedExpenses && settings.fixedExpenses.length > 0 && (
        <section className="rounded-[10px] bg-card px-5 py-2 text-sm">
          <ul className="divide-y divide-line">
            {settings.fixedExpenses.map((item) => {
              const paid = isPaidThisCycle(item, budget.cycleKey);
              return (
                <li key={item.id} className="flex items-center justify-between gap-3 py-1.5">
                  <span className={paid ? "text-sub line-through" : ""}>
                    {item.name} · <span className="tabular-nums">{formatWon(item.amount)}원</span>
                  </span>
                  <button
                    type="button"
                    aria-pressed={paid}
                    onClick={() => handleTogglePaid(item.id)}
                    className={`min-h-11 shrink-0 rounded-md px-3 text-sm font-semibold ${
                      paid ? "border border-line text-sub" : "bg-btn text-white"
                    }`}
                  >
                    {paid ? "취소" : "나갔어요"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
