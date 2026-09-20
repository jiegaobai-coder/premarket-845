import type {
  Confirmation,
  OiStatus,
  OptionSide,
  Persistence,
  StrikeLocation,
  Tenor,
} from "./types";

export function formatSigned(n: number, digits = 0): string {
  const abs = Math.abs(n).toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
  if (n > 0) return `+${abs}`;
  if (n < 0) return `−${abs}`;
  return abs;
}

export function formatPct(n: number): string {
  return `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(2)}%`;
}

export function formatPremium(mm: number): string {
  if (mm >= 1) return `$${mm.toFixed(1)}M`;
  return `$${(mm * 1000).toFixed(0)}K`;
}

export function contractLabel(expiry: string, strike: number, side: OptionSide): string {
  const d = expiry.slice(5).replace("-", "/");
  return `${d} ${strike}${side === "call" ? "C" : "P"}`;
}

export const oiStatusLabel: Record<OiStatus, string> = {
  net_increase: "OI 净增加",
  net_decrease: "OI 净减少",
  flat: "变化不明显",
  not_updated: "尚未更新",
};

export const confirmationLabel: Record<Confirmation, string> = {
  reinforced: "被增强",
  weakened: "被削弱",
  invalidated: "被撤销",
  unchanged: "变化不明显",
  not_updated: "尚未更新",
};

export const sideLabel: Record<OptionSide, string> = {
  call: "Call",
  put: "Put",
};

export const tenorLabel: Record<Tenor, string> = {
  weekly: "周度",
  monthly: "月度",
};

export const strikeLabel: Record<StrikeLocation, string> = {
  itm: "ITM",
  atm: "ATM",
  near_otm: "近 OTM",
  far_otm: "远 OTM",
};

export const persistenceLabel: Record<Persistence, string> = {
  multi_day: "连续多日",
  yesterday_only: "仅昨日",
};
