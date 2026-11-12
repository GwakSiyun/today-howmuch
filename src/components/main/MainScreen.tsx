// 메인 화면 (인스타 목업 기준) — 위→아래: 헤더 · 금액 카드 · 잔액 · 월급날까지 · 지난번보다 · 고정 지출
import { useState } from "react";
import { calcDailyBudget } from "@/lib/budget";
import { formatHeaderDate } from "@/lib/format";
import { compareLastTwo, recentHistory } from "@/lib/history";
import { diffInDays, fromDateKey, prevPayday } from "@/lib/payday";
import { getBudgetStatus } from "@/lib/status";
import { saveAppData, type AppData } from "@/lib/storage";
import AmountCard from "./AmountCard";
import BalanceCard from "./BalanceCard";
import BalanceSheet from "./BalanceSheet";
import CompareCard from "./CompareCard";
import FixedExpenseCard from "./FixedExpenseCard";
import FixedExpenseSheet from "./FixedExpenseSheet";
import PaydayCard from "./PaydayCard";
import SettingsSheet from "./SettingsSheet";

type SheetKind = "balance" | "fixed" | "settings";

interface MainScreenProps {
  data: AppData;
  /** 저장 함수. 기본은 기기 localStorage. 미리보기는 저장 안 하는 함수를 넘긴다 */
  save?: (next: AppData) => boolean;
  /** 기준 날짜. 기본은 지금 */
  now?: Date;
}

export default function MainScreen({ data, save = saveAppData, now }: MainScreenProps): React.ReactNode {
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const today = now ?? new Date();
  const { settings, balances } = data;
  const latest = balances[balances.length - 1];
  const rule = { payDay: settings.payDay, earlyOnDayOff: settings.earlyOnDayOff };

  const budget = calcDailyBudget({
    balance: latest.balance,
    fixedExpenses: settings.useFixedExpenses ? settings.fixedExpenses : [],
    today,
    rule,
  });
  const status = getBudgetStatus(budget.daily);
  const daysSinceInput = Math.max(0, diffInDays(fromDateKey(latest.date), today));

  const cycleStart = prevPayday(today, rule);
  const cycleDays = Math.max(1, diffInDays(cycleStart, budget.payday));
  const progress = 1 - budget.daysLeft / cycleDays;

  const closeSheet = (): void => setSheet(null);
  const hasFixed = settings.useFixedExpenses && settings.fixedExpenses.length > 0;

  return (
    <div className="flex flex-col gap-2.5">
      <header className="flex items-center justify-between">
        <h1 className="text-[17px] font-bold">오늘얼마</h1>
        <div className="flex items-center gap-1">
          <span className="text-sm text-sub tabular-nums">{formatHeaderDate(today)}</span>
          <button
            type="button"
            onClick={() => setSheet("settings")}
            className="-mr-2 min-h-11 px-2 text-sm text-sub underline underline-offset-2"
          >
            설정
          </button>
        </div>
      </header>

      <AmountCard
        daily={budget.daily}
        status={status}
        daysSinceInput={daysSinceInput}
        onChangeBalance={() => setSheet("balance")}
      />
      <BalanceCard balance={latest.balance} daysSinceInput={daysSinceInput} onChange={() => setSheet("balance")} />
      <PaydayCard daysLeft={budget.daysLeft} payday={budget.payday} progress={progress} />
      <CompareCard
        comparison={compareLastTwo(balances, settings)}
        history={recentHistory(balances, settings)}
        today={today}
      />

      {hasFixed ? (
        <FixedExpenseCard data={data} cycleKey={budget.cycleKey} save={save} onEdit={() => setSheet("fixed")} />
      ) : (
        // 첫 설정에서 건너뛴 사람도 여기서 바로 추가
        <button
          type="button"
          onClick={() => setSheet("fixed")}
          className="min-h-12 rounded-[10px] border border-dashed border-sub/40 px-5 text-left text-[13px] text-sub"
        >
          + 고정 지출 추가 <span className="text-sub/70">· 월세·통신비처럼 아직 안 나간 돈</span>
        </button>
      )}

      {sheet === "balance" && <BalanceSheet data={data} save={save} onClose={closeSheet} />}
      {sheet === "fixed" && <FixedExpenseSheet data={data} save={save} onClose={closeSheet} />}
      {sheet === "settings" && (
        <SettingsSheet data={data} save={save} onClose={closeSheet} onEditFixed={() => setSheet("fixed")} />
      )}
    </div>
  );
}
