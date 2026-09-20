import type { FilterState, OiStatus, TabId, Universe } from "./types";

const OI_VALUES: OiStatus[] = [
  "net_increase",
  "net_decrease",
  "flat",
  "not_updated",
];

export function parseOiParam(raw?: string): OiStatus[] {
  if (!raw) return [];
  return raw
    .split(",")
    .filter((value): value is OiStatus => OI_VALUES.includes(value as OiStatus));
}

export function briefingHref(opts: {
  tab: TabId;
  universe?: Universe;
  oiStatus?: OiStatus[];
}) {
  const params = new URLSearchParams();
  if (opts.tab !== "focus") params.set("tab", opts.tab);
  if (opts.universe === "watchlist") params.set("universe", "watchlist");
  if (opts.oiStatus?.length) params.set("oi", opts.oiStatus.join(","));
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function toggleOi(current: OiStatus[], value: OiStatus): OiStatus[] {
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}

export function filtersFromQuery(
  extra: FilterState,
  universe: Universe,
  oiStatus: OiStatus[],
): FilterState {
  return {
    ...extra,
    universe,
    oiStatus,
  };
}
