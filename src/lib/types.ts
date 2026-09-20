export type TabId = "focus" | "oi" | "structure" | "price" | "risk";

export type OiStatus = "net_increase" | "net_decrease" | "flat" | "not_updated";

export type Confirmation =
  | "reinforced"
  | "weakened"
  | "invalidated"
  | "unchanged"
  | "not_updated";

export type OptionSide = "call" | "put";
export type Tenor = "weekly" | "monthly";
export type StrikeLocation = "itm" | "atm" | "near_otm" | "far_otm";
export type Persistence = "multi_day" | "yesterday_only";
export type PriceWaitKind = "hold" | "break" | "reclaim";
export type Universe = "watchlist" | "all";

export interface OptionContract {
  id: string;
  expiry: string;
  tenor: Tenor;
  strike: number;
  side: OptionSide;
  yesterdayVolume: number;
  yesterdayPremiumMm: number;
  volumeToPriorOi: number;
  oiChange: number | null;
  oiStatus: OiStatus;
  strikeLocation: StrikeLocation;
  unusualSize: boolean;
  persistence: Persistence;
  consecutiveDays: number;
  note: string;
}

export interface PriceConfirm {
  needed: boolean;
  kind: PriceWaitKind;
  level: number;
  label: string;
}

export interface StructureView {
  weeklyBias: "call" | "put" | "mixed" | "none";
  monthlyBias: "call" | "put" | "mixed" | "none";
  aligned: boolean;
  conflict: boolean;
  keyContracts: string[];
  note: string;
}

export interface SymbolBrief {
  ticker: string;
  name: string;
  watchlist: boolean;
  lastClose: number;
  closeChangePct: number;
  overnightNote: string;
  focusRank: number | null;
  confirmation: Confirmation;
  yesterdayFinding: string;
  morningConfirm: string;
  whyWatch: string;
  afterOpen: string;
  invalidation: string;
  entryPath: string;
  contracts: OptionContract[];
  structure: StructureView;
  priceConfirm: PriceConfirm;
  risks: string[];
  chaseRisk: boolean;
  structureConflict: boolean;
  earningsSoon: boolean;
  incompleteData: boolean;
  tabs: TabId[];
}

export interface PdfArchiveItem {
  id: string;
  date: string;
  filename: string;
  generatedAt: string;
  status: "parsed" | "archive_only" | "missing";
  summary: string;
  symbolCount: number;
  oiUpdated: number;
  oiPending: number;
}

export interface BriefingSession {
  id: string;
  date: string;
  label: string;
  asOf: string;
  timezone: string;
  yesterdaySession: string;
  sourcePdf: string;
  marketNote: string;
  watchlist: string[];
  symbols: SymbolBrief[];
  archive: PdfArchiveItem;
}

export interface FilterState {
  universe: Universe;
  query: string;
  oiStatus: OiStatus[];
  side: OptionSide[];
  tenor: Tenor[];
  unusualSize: boolean;
  largeOiMove: boolean;
  strikeLocation: StrikeLocation[];
  persistence: Persistence | null;
  structureView: "aligned" | "conflict" | null;
  riskKind: Array<"chase" | "conflict" | "earnings" | "incomplete">;
}

export const defaultFilters: FilterState = {
  universe: "all",
  query: "",
  oiStatus: [],
  side: [],
  tenor: [],
  unusualSize: false,
  largeOiMove: false,
  strikeLocation: [],
  persistence: null,
  structureView: null,
  riskKind: [],
};
