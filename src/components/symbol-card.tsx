import { Badge } from "@/components/ui/badge";
import {
  confirmationLabel,
  contractLabel,
  formatPct,
  formatPremium,
  formatSigned,
  oiStatusLabel,
  persistenceLabel,
  strikeLabel,
  tenorLabel,
} from "@/lib/format";
import type { FilterState, SymbolBrief } from "@/lib/types";
import { explainEntry } from "@/lib/filters";
import { cn } from "@/lib/utils";

const confirmTone: Record<SymbolBrief["confirmation"], string> = {
  reinforced: "text-[var(--up)] border-[var(--up)]/30 bg-[var(--up)]/10",
  weakened: "text-[var(--down)] border-[var(--down)]/30 bg-[var(--down)]/10",
  invalidated: "text-[var(--down)] border-[var(--down)]/40 bg-[var(--down)]/15",
  unchanged: "text-muted-foreground border-white/15 bg-white/5",
  not_updated: "text-[var(--pending)] border-[var(--pending)]/40 bg-[var(--pending)]/10",
};

function Section({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-white/8 py-3 first:border-t-0 first:pt-0">
      <div className="mt-0.5 font-mono text-[10px] tracking-wider text-[var(--tos-orange)]">
        {step}
      </div>
      <div>
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground">
          {title}
        </div>
        <div className="mt-1 text-sm leading-6 text-foreground/90">{children}</div>
      </div>
    </div>
  );
}

export function SymbolCard({
  symbol,
  filters,
  highlightRank = false,
}: {
  symbol: SymbolBrief;
  filters: FilterState;
  highlightRank?: boolean;
}) {
  const reasons = explainEntry(symbol, filters);
  const up = symbol.closeChangePct >= 0;

  return (
    <article
      className={cn(
        "rounded-xl border bg-[var(--panel)] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]",
        symbol.confirmation === "not_updated"
          ? "border-[var(--pending)]/35"
          : "border-white/10",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {highlightRank && symbol.focusRank != null ? (
              <span className="flex size-6 items-center justify-center rounded-md bg-[var(--tos-orange)] text-xs font-bold text-black">
                {symbol.focusRank}
              </span>
            ) : null}
            <h3 className="font-heading text-lg font-semibold tracking-tight">
              {symbol.ticker}
            </h3>
            <span className="text-sm text-muted-foreground">{symbol.name}</span>
            {symbol.watchlist ? (
              <Badge variant="outline" className="border-[var(--tos-orange)]/40 text-[var(--tos-orange)]">
                自选
              </Badge>
            ) : (
              <Badge variant="outline">全部扫描</Badge>
            )}
            <Badge variant="outline" className={confirmTone[symbol.confirmation]}>
              {confirmationLabel[symbol.confirmation]}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-2 font-mono text-sm">
            <span>{symbol.lastClose.toFixed(2)}</span>
            <span className={up ? "text-[var(--up)]" : "text-[var(--down)]"}>
              {formatPct(symbol.closeChangePct)}
            </span>
            <span className="text-xs text-muted-foreground">{symbol.overnightNote}</span>
          </div>
        </div>
      </header>

      <div className="mt-3 rounded-lg border border-white/8 bg-black/20 px-3 py-2">
        <div className="text-[10px] tracking-[0.16em] text-[var(--tos-orange)] uppercase">
          为什么出现在当前结果
        </div>
        <ul className="mt-1 space-y-0.5 text-sm leading-6">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>

      <Section step="01" title="昨天发现了什么">
        {symbol.yesterdayFinding}
      </Section>
      <Section step="02" title="今晨确认了什么">
        {symbol.morningConfirm}
      </Section>
      <Section step="03" title="为什么值得关注">
        {symbol.whyWatch}
      </Section>
      <Section step="04" title="开盘后看什么">
        {symbol.afterOpen}
      </Section>
      <Section step="05" title="什么情况会使判断失效">
        {symbol.invalidation}
      </Section>

      {symbol.priceConfirm.needed ? (
        <div className="rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-sm">
          <span className="text-[11px] text-muted-foreground">等待价格确认 · </span>
          {symbol.priceConfirm.label}
        </div>
      ) : null}

      {symbol.structure.conflict || symbol.structure.aligned ? (
        <div className="mt-2 text-sm leading-6 text-foreground/85">
          <span className="text-[11px] text-muted-foreground">
            周月结构 · 关键合约 {symbol.structure.keyContracts.join(" / ")} ·{" "}
          </span>
          {symbol.structure.note}
        </div>
      ) : null}

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="text-[10px] tracking-wide text-muted-foreground uppercase">
            <tr className="border-b border-white/8">
              <th className="py-1.5 pr-3 font-medium">合约</th>
              <th className="py-1.5 pr-3 font-medium">期限</th>
              <th className="py-1.5 pr-3 font-medium">位置</th>
              <th className="py-1.5 pr-3 font-medium">昨成交</th>
              <th className="py-1.5 pr-3 font-medium">权利金</th>
              <th className="py-1.5 pr-3 font-medium">今晨 OI</th>
              <th className="py-1.5 pr-3 font-medium">节奏</th>
            </tr>
          </thead>
          <tbody>
            {symbol.contracts.map((c) => (
              <tr key={c.id} className="border-b border-white/5 last:border-0">
                <td className="py-2 pr-3 font-mono">
                  {contractLabel(c.expiry, c.strike, c.side)}
                </td>
                <td className="py-2 pr-3">{tenorLabel[c.tenor]}</td>
                <td className="py-2 pr-3">{strikeLabel[c.strikeLocation]}</td>
                <td className="py-2 pr-3 font-mono">
                  {c.yesterdayVolume.toLocaleString()}
                  {c.unusualSize ? (
                    <span className="ml-1 text-[var(--tos-orange)]">异常</span>
                  ) : null}
                </td>
                <td className="py-2 pr-3 font-mono">{formatPremium(c.yesterdayPremiumMm)}</td>
                <td className="py-2 pr-3 font-mono">
                  {c.oiStatus === "not_updated" ? (
                    <span className="text-[var(--pending)]">尚未更新</span>
                  ) : (
                    <span
                      className={
                        c.oiStatus === "net_increase"
                          ? "text-[var(--up)]"
                          : c.oiStatus === "net_decrease"
                            ? "text-[var(--down)]"
                            : "text-muted-foreground"
                      }
                    >
                      {c.oiChange != null ? formatSigned(c.oiChange) : "—"}{" "}
                      <span className="text-muted-foreground">
                        {oiStatusLabel[c.oiStatus]}
                      </span>
                    </span>
                  )}
                </td>
                <td className="py-2 pr-3">
                  {persistenceLabel[c.persistence]}
                  {c.consecutiveDays > 1 ? ` · ${c.consecutiveDays} 日` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
