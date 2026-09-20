"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, ListFilter } from "lucide-react";

import { FilterBar } from "@/components/filter-bar";
import { SymbolCard } from "@/components/symbol-card";
import { briefing } from "@/data/briefing";
import {
  activeFilterLabels,
  countByTab,
  filterSymbols,
  groupByConfirmation,
  tabQuestion,
} from "@/lib/filters";
import { briefingHref, parseOiParam } from "@/lib/href";
import { focusQueue, oiFreshness } from "@/lib/session";
import { defaultFilters, type FilterState, type TabId, type Universe } from "@/lib/types";
import { cn } from "@/lib/utils";

const tabs: { id: TabId; label: string; short: string }[] = [
  { id: "focus", label: "今日关注", short: "先看谁" },
  { id: "oi", label: "昨日异动 → 今晨 OI 确认", short: "OI 确认" },
  { id: "structure", label: "周度／月度结构", short: "周月结构" },
  { id: "price", label: "等待价格确认", short: "等价格" },
  { id: "risk", label: "风险与分歧", short: "风险" },
];

function parseTab(raw: string | null): TabId {
  return tabs.some((item) => item.id === raw) ? (raw as TabId) : "focus";
}

const groupCopy: Record<
  ReturnType<typeof groupByConfirmation>[number]["key"],
  { hint: string; bar: string }
> = {
  reinforced: { hint: "昨日线索被今晨同合约 OI 净增坐实", bar: "bg-[var(--up)]" },
  weakened: { hint: "有成交，但今晨 OI 在减，方向被削弱", bar: "bg-[var(--down)]" },
  invalidated: { hint: "OI 大幅回吐，昨天的判断按撤销处理", bar: "bg-[var(--down)]" },
  unchanged: { hint: "数据已到，只是 OI 几乎没动。不是尚未更新。", bar: "bg-white/40" },
  not_updated: { hint: "尚未更新 ≠ 没有确认，不能当成削弱或撤销", bar: "bg-[var(--pending)]" },
};

export function BriefingBoard({
  initialTab,
  initialOi,
  initialUniverse,
}: {
  initialTab?: string;
  initialOi?: string;
  initialUniverse?: string;
}) {
  const tab = parseTab(initialTab ?? null);
  const universe: Universe = initialUniverse === "watchlist" ? "watchlist" : "all";
  const oiStatus = parseOiParam(initialOi);
  const [extraFilters, setExtraFilters] = useState<FilterState>(defaultFilters);
  const session = briefing;
  const fresh = oiFreshness(session.symbols);
  const queue = focusQueue(session.symbols);
  const counts = countByTab(session.symbols);

  const results = useMemo(
    () =>
      filterSymbols(session.symbols, tab, {
        ...extraFilters,
        universe,
        oiStatus,
      }),
    [session.symbols, tab, extraFilters, universe, oiStatus],
  );
  const filters: FilterState = {
    ...extraFilters,
    universe,
    oiStatus,
  };
  const filterLabels = activeFilterLabels(filters);
  const oiGroups = tab === "oi" ? groupByConfirmation(results) : [];
  const activeTab = tabs.find((item) => item.id === tab)!;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-5 pb-16 sm:px-6">
      <header className="flex flex-col gap-3 border-b border-white/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[11px] tracking-[0.22em] text-[var(--tos-orange)] uppercase">
            {session.label} · 主入口
          </div>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            今天先看谁，为什么看，还缺什么
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {session.yesterdaySession} 的线索，用 {session.asOf} 的 OI 修正。
            PDF（{session.sourcePdf}）只作存档，不在这里继续往下读。
          </p>
          <p className="mt-2 max-w-2xl rounded-md border border-[var(--tos-orange)]/30 bg-[var(--tos-orange)]/10 px-3 py-2 text-sm leading-6 text-foreground/90">
            8:45 是每天打开来看的时刻，不是自动刷新时间。当前名单来自
            {session.archive.generatedAt} 生成的 {session.sourcePdf}
            。换了第二天的 PDF 并写进数据后，这里才会变成新的一天。
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Stat label="今日先看" value={`${queue.length} 只`} />
          <Stat label="OI 已更新" value={`${fresh.updated}`} tone="up" />
          <Stat label="尚未更新" value={`${fresh.pending}`} tone="warn" />
        </div>
      </header>

      <p className="rounded-lg border border-white/10 bg-[var(--panel)] px-3 py-2 text-sm leading-6 text-foreground/85">
        {session.marketNote}
      </p>

      <div
        role="tablist"
        aria-label="盘前问题"
        className="sticky top-12 z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-white/10 bg-[#0e1219]/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:top-auto"
      >
        {tabs.map((item) => {
          const selected = tab === item.id;
          return (
            <Link
              key={item.id}
              href={briefingHref({ tab: item.id, universe, oiStatus })}
              scroll={false}
              role="tab"
              aria-selected={selected}
              data-testid={`tab-${item.id}`}
              className={cn(
                "relative flex min-h-14 min-w-32 shrink-0 flex-col items-start justify-center gap-0.5 px-3 py-2 text-left text-sm transition-colors",
                selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.short}</span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {counts[item.id]} 只
              </span>
              {selected ? (
                <span className="absolute inset-x-3 -bottom-px h-0.5 bg-[var(--tos-orange)]" />
              ) : null}
            </Link>
          );
        })}
      </div>

      <div key={tab} className="space-y-4" data-active-tab={tab}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            <span className="mr-2 text-foreground">{activeTab.label}</span>
            {tabQuestion(tab)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ListFilter className="size-3.5" />
            {results.length} 只命中
          </div>
        </div>

        <FilterBar
          tab={tab}
          filters={filters}
          onChange={setExtraFilters}
          onReset={() => setExtraFilters(defaultFilters)}
        />

        {filterLabels.length > 0 ? (
          <div className="rounded-lg border border-[var(--tos-orange)]/40 bg-[var(--tos-orange)]/10 px-3 py-2 text-sm">
            当前筛选：{filterLabels.join(" · ")}。每张卡片会说明它为什么还留在这个结果里。
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            未加筛选时，按这个 Tab 的问题排序，而不是按一个笼统分数。
          </div>
        )}

        {tab === "focus" && results.length > 0 ? (
          <ol className="grid gap-2 rounded-xl border border-white/10 bg-[var(--panel)] p-3 sm:grid-cols-2">
            {results.map((symbol) => (
              <li key={symbol.ticker} className="flex gap-3 text-sm leading-6">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-[var(--tos-orange)] text-[11px] font-bold text-black">
                  {symbol.focusRank}
                </span>
                <span>
                  <span className="font-medium">{symbol.ticker}</span>
                  <span className="text-muted-foreground"> · {symbol.entryPath}</span>
                </span>
              </li>
            ))}
          </ol>
        ) : null}

        {tab === "oi" && oiGroups.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-xs">
            {oiGroups.map((group) => (
              <span
                key={group.key}
                className={cn(
                  "rounded-md border px-2 py-1",
                  group.key === "not_updated" &&
                    "border-[var(--pending)]/40 text-[var(--pending)]",
                  group.key === "reinforced" && "border-[var(--up)]/30 text-[var(--up)]",
                  (group.key === "weakened" || group.key === "invalidated") &&
                    "border-[var(--down)]/30 text-[var(--down)]",
                  group.key === "unchanged" && "border-white/15 text-muted-foreground",
                )}
              >
                {group.label} {group.items.length}
                {group.key === "not_updated" ? " · ≠ 没有确认" : ""}
              </span>
            ))}
          </div>
        ) : null}

        {tab === "oi" && results.some((s) => s.confirmation === "not_updated") ? (
          <div className="flex gap-2 rounded-lg border border-[var(--pending)]/30 bg-[var(--pending)]/10 px-3 py-2 text-sm text-[var(--pending)]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            尚未更新单独成组，不会混进“变化不明显”或“没有确认”。数据没到，就还不能改写昨天的判断。
          </div>
        ) : null}

        {results.length === 0 ? (
          <EmptyState tab={tab} />
        ) : tab === "oi" ? (
          <div className="space-y-8">
            {oiGroups.map((group) => (
              <section key={group.key} className="space-y-3">
                <div className="flex items-start gap-3 border-b border-white/10 pb-2">
                  <div className={cn("mt-1 h-5 w-1 shrink-0 rounded", groupCopy[group.key].bar)} />
                  <div>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h2
                        className={cn(
                          "text-base font-semibold",
                          group.key === "not_updated" && "text-[var(--pending)]",
                          group.key === "reinforced" && "text-[var(--up)]",
                          (group.key === "weakened" || group.key === "invalidated") &&
                            "text-[var(--down)]",
                        )}
                      >
                        {group.label}
                      </h2>
                      <span className="text-xs text-muted-foreground">{group.items.length} 只</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {groupCopy[group.key].hint}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4">
                  {group.items.map((symbol) => (
                    <SymbolCard key={symbol.ticker} symbol={symbol} filters={filters} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {results.map((symbol) => (
              <SymbolCard
                key={symbol.ticker}
                symbol={symbol}
                filters={filters}
                highlightRank={tab === "focus"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "warn";
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-[var(--panel)] px-3 py-2">
      <div className="text-[10px] tracking-wide text-muted-foreground uppercase">{label}</div>
      <div
        className={cn(
          "mt-1 font-mono text-sm",
          tone === "up" && "text-[var(--up)]",
          tone === "warn" && "text-[var(--pending)]",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: TabId }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center">
      <p className="text-sm text-foreground">当前筛选下没有股票。</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {tab === "oi"
          ? "OI 尚未更新的名字不会出现在净增加/净减少里。如果在找 META，请改用“尚未更新”。"
          : "试着放宽 Call/Put、期限或自选范围。空筛选会回到这个 Tab 的完整观察名单。"}
      </p>
    </div>
  );
}
