import type { FilterState, SymbolBrief, TabId } from "./types";
import { confirmationLabel, oiStatusLabel, sideLabel, tenorLabel } from "./format";

const LARGE_OI = 4000;

export function symbolMatchesTab(symbol: SymbolBrief, tab: TabId): boolean {
  return symbol.tabs.includes(tab);
}

function matchingContracts(symbol: SymbolBrief, filters: FilterState) {
  return symbol.contracts.filter((c) => {
    if (filters.oiStatus.length && !filters.oiStatus.includes(c.oiStatus)) return false;
    if (filters.side.length && !filters.side.includes(c.side)) return false;
    if (filters.tenor.length && !filters.tenor.includes(c.tenor)) return false;
    if (filters.unusualSize && !c.unusualSize) return false;
    if (filters.largeOiMove) {
      if (c.oiChange == null || Math.abs(c.oiChange) < LARGE_OI) return false;
    }
    if (
      filters.strikeLocation.length &&
      !filters.strikeLocation.includes(c.strikeLocation)
    ) {
      return false;
    }
    if (filters.persistence && c.persistence !== filters.persistence) return false;
    return true;
  });
}

export function symbolMatchesFilters(
  symbol: SymbolBrief,
  tab: TabId,
  filters: FilterState,
): boolean {
  if (!symbolMatchesTab(symbol, tab)) return false;
  if (filters.universe === "watchlist" && !symbol.watchlist) return false;
  if (filters.query.trim()) {
    const q = filters.query.trim().toLowerCase();
    const hit =
      symbol.ticker.toLowerCase().includes(q) ||
      symbol.name.toLowerCase().includes(q);
    if (!hit) return false;
  }
  if (filters.structureView === "aligned" && !symbol.structure.aligned) return false;
  if (filters.structureView === "conflict" && !symbol.structure.conflict) return false;
  if (filters.riskKind.length) {
    const hit = filters.riskKind.some((kind) => {
      if (kind === "chase") return symbol.chaseRisk;
      if (kind === "conflict") return symbol.structureConflict;
      if (kind === "earnings") return symbol.earningsSoon;
      return symbol.incompleteData;
    });
    if (!hit) return false;
  }
  const contractFiltersActive =
    filters.oiStatus.length > 0 ||
    filters.side.length > 0 ||
    filters.tenor.length > 0 ||
    filters.unusualSize ||
    filters.largeOiMove ||
    filters.strikeLocation.length > 0 ||
    filters.persistence != null;
  if (contractFiltersActive && matchingContracts(symbol, filters).length === 0) {
    return false;
  }
  return true;
}

export function filterSymbols(
  symbols: SymbolBrief[],
  tab: TabId,
  filters: FilterState,
): SymbolBrief[] {
  const matched = symbols.filter((s) => symbolMatchesFilters(s, tab, filters));
  if (tab === "focus") {
    return matched.sort((a, b) => (a.focusRank ?? 99) - (b.focusRank ?? 99));
  }
  if (tab === "oi") {
    const order: Record<string, number> = {
      reinforced: 0,
      weakened: 1,
      invalidated: 2,
      unchanged: 3,
      not_updated: 4,
    };
    return matched.sort(
      (a, b) => (order[a.confirmation] ?? 9) - (order[b.confirmation] ?? 9),
    );
  }
  return matched.sort((a, b) => a.ticker.localeCompare(b.ticker));
}

export function activeFilterLabels(filters: FilterState): string[] {
  const labels: string[] = [];
  if (filters.universe === "watchlist") labels.push("自选股");
  if (filters.oiStatus.length) {
    labels.push(filters.oiStatus.map((s) => oiStatusLabel[s]).join(" / "));
  }
  if (filters.side.length) labels.push(filters.side.map((s) => sideLabel[s]).join(" / "));
  if (filters.tenor.length) {
    labels.push(filters.tenor.map((s) => tenorLabel[s]).join(" / "));
  }
  if (filters.unusualSize) labels.push("异常成交规模");
  if (filters.largeOiMove) labels.push("OI 变化幅度大");
  if (filters.strikeLocation.length) {
    const map = { itm: "ITM", atm: "ATM", near_otm: "近 OTM", far_otm: "远 OTM" };
    labels.push(filters.strikeLocation.map((s) => map[s]).join(" / "));
  }
  if (filters.persistence === "multi_day") labels.push("连续多日");
  if (filters.persistence === "yesterday_only") labels.push("仅昨日出现");
  if (filters.structureView === "aligned") labels.push("周月一致");
  if (filters.structureView === "conflict") labels.push("周月冲突");
  if (filters.riskKind.includes("chase")) labels.push("追高风险");
  if (filters.riskKind.includes("conflict")) labels.push("结构冲突");
  if (filters.riskKind.includes("earnings")) labels.push("临近财报");
  if (filters.riskKind.includes("incomplete")) labels.push("数据不完整");
  if (filters.query.trim()) labels.push(`搜索 ${filters.query.trim().toUpperCase()}`);
  return labels;
}

export function explainEntry(symbol: SymbolBrief, filters: FilterState): string[] {
  const reasons = [symbol.entryPath];
  const extras = activeFilterLabels(filters).filter((label) => label !== "自选股");
  if (filters.universe === "watchlist" && symbol.watchlist) {
    reasons.push("在自选股里");
  }
  if (extras.length) reasons.push(`命中筛选：${extras.join(" · ")}`);
  if (symbol.confirmation === "not_updated") {
    reasons.push("尚未更新 ≠ 没有确认，不能当成削弱或撤销");
  }
  return reasons;
}

export function tabQuestion(tab: TabId): string {
  switch (tab) {
    case "focus":
      return "哪几只股票最值得先看？关注原因是什么？";
    case "oi":
      return "昨天 16:00 的线索，哪些被增强、削弱或撤销？哪些还没更新？";
    case "structure":
      return "哪些期限的线索一致，哪些互相冲突？关键合约在哪里？";
    case "price":
      return "资金线索已经出现，但还需要股价站上、守住或收回什么位置？";
    case "risk":
      return "哪些存在追高、结构冲突、财报或数据不完整的问题？";
  }
}

export function groupByConfirmation(symbols: SymbolBrief[]) {
  const groups: { key: SymbolBrief["confirmation"]; label: string; items: SymbolBrief[] }[] =
    [
      { key: "reinforced", label: confirmationLabel.reinforced, items: [] },
      { key: "weakened", label: confirmationLabel.weakened, items: [] },
      { key: "invalidated", label: confirmationLabel.invalidated, items: [] },
      { key: "unchanged", label: confirmationLabel.unchanged, items: [] },
      { key: "not_updated", label: confirmationLabel.not_updated, items: [] },
    ];
  for (const symbol of symbols) {
    const group = groups.find((g) => g.key === symbol.confirmation);
    if (group) group.items.push(symbol);
  }
  return groups.filter((g) => g.items.length > 0);
}
