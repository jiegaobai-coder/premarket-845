import { briefing } from "@/data/briefing";
import type { SymbolBrief } from "./types";

export function getSession() {
  return briefing;
}

export function oiFreshness(symbols: SymbolBrief[] = briefing.symbols) {
  const pending = symbols.filter((s) => s.confirmation === "not_updated" || s.incompleteData);
  const updated = symbols.filter((s) => s.confirmation !== "not_updated");
  return {
    total: symbols.length,
    updated: updated.length,
    pending: pending.length,
    pendingTickers: pending.map((s) => s.ticker),
  };
}

export function focusQueue(symbols: SymbolBrief[] = briefing.symbols) {
  return symbols
    .filter((s) => s.focusRank != null)
    .sort((a, b) => (a.focusRank ?? 99) - (b.focusRank ?? 99));
}
