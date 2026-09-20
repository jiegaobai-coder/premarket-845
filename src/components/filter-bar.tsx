"use client";

import { X } from "lucide-react";

import { Chip, FilterGroup } from "@/components/filter-chip";
import { Input } from "@/components/ui/input";
import type { FilterState, OiStatus, OptionSide, StrikeLocation, TabId, Tenor } from "@/lib/types";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

export function FilterBar({
  tab,
  filters,
  onChange,
  onReset,
}: {
  tab: TabId;
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
}) {
  const showOi = tab === "oi" || tab === "focus";
  const showStructure = tab === "structure";
  const showRisk = tab === "risk";

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-[var(--panel)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          Tab 负责分问题，Filter 负责缩小范围。空着表示不限制。
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="size-3" />
          清空筛选
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FilterGroup label="范围">
          <Chip
            pressed={filters.universe === "watchlist"}
            onClick={() => onChange({ ...filters, universe: "watchlist" })}
          >
            自选股
          </Chip>
          <Chip
            pressed={filters.universe === "all"}
            onClick={() => onChange({ ...filters, universe: "all" })}
          >
            全部标的
          </Chip>
        </FilterGroup>

        <FilterGroup label="搜索">
          <Input
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="代码或名称"
            className="h-7 w-44 bg-black/20 text-xs"
          />
        </FilterGroup>

        {showOi ? (
          <FilterGroup label="今晨 OI">
            {(
              [
                ["net_increase", "净增加", "up"],
                ["net_decrease", "净减少", "down"],
                ["flat", "变化不明显", "default"],
                ["not_updated", "尚未更新", "warn"],
              ] as [OiStatus, string, "up" | "down" | "default" | "warn"][]
            ).map(([value, label, tone]) => (
              <Chip
                key={value}
                tone={tone}
                pressed={filters.oiStatus.includes(value)}
                onClick={() =>
                  onChange({ ...filters, oiStatus: toggle(filters.oiStatus, value) })
                }
              >
                {label}
              </Chip>
            ))}
          </FilterGroup>
        ) : null}

        <FilterGroup label="Call / Put">
          {(["call", "put"] as OptionSide[]).map((side) => (
            <Chip
              key={side}
              pressed={filters.side.includes(side)}
              onClick={() => onChange({ ...filters, side: toggle(filters.side, side) })}
            >
              {side === "call" ? "Call" : "Put"}
            </Chip>
          ))}
        </FilterGroup>

        <FilterGroup label="期限">
          {(["weekly", "monthly"] as Tenor[]).map((tenor) => (
            <Chip
              key={tenor}
              pressed={filters.tenor.includes(tenor)}
              onClick={() => onChange({ ...filters, tenor: toggle(filters.tenor, tenor) })}
            >
              {tenor === "weekly" ? "周度" : "月度"}
            </Chip>
          ))}
        </FilterGroup>

        <FilterGroup label="规模与幅度">
          <Chip
            pressed={filters.unusualSize}
            onClick={() => onChange({ ...filters, unusualSize: !filters.unusualSize })}
          >
            异常成交规模
          </Chip>
          <Chip
            pressed={filters.largeOiMove}
            onClick={() => onChange({ ...filters, largeOiMove: !filters.largeOiMove })}
          >
            OI 变化幅度大
          </Chip>
        </FilterGroup>

        <FilterGroup label="行权价位置">
          {(
            [
              ["itm", "ITM"],
              ["atm", "ATM"],
              ["near_otm", "近 OTM"],
              ["far_otm", "远 OTM"],
            ] as [StrikeLocation, string][]
          ).map(([value, label]) => (
            <Chip
              key={value}
              pressed={filters.strikeLocation.includes(value)}
              onClick={() =>
                onChange({
                  ...filters,
                  strikeLocation: toggle(filters.strikeLocation, value),
                })
              }
            >
              {label}
            </Chip>
          ))}
        </FilterGroup>

        <FilterGroup label="出现节奏">
          <Chip
            pressed={filters.persistence === "multi_day"}
            onClick={() =>
              onChange({
                ...filters,
                persistence: filters.persistence === "multi_day" ? null : "multi_day",
              })
            }
          >
            连续多日
          </Chip>
          <Chip
            pressed={filters.persistence === "yesterday_only"}
            onClick={() =>
              onChange({
                ...filters,
                persistence:
                  filters.persistence === "yesterday_only" ? null : "yesterday_only",
              })
            }
          >
            仅昨日出现
          </Chip>
        </FilterGroup>

        {showStructure ? (
          <FilterGroup label="周月关系">
            <Chip
              pressed={filters.structureView === "aligned"}
              onClick={() =>
                onChange({
                  ...filters,
                  structureView: filters.structureView === "aligned" ? null : "aligned",
                })
              }
            >
              期限一致
            </Chip>
            <Chip
              tone="warn"
              pressed={filters.structureView === "conflict"}
              onClick={() =>
                onChange({
                  ...filters,
                  structureView: filters.structureView === "conflict" ? null : "conflict",
                })
              }
            >
              互相冲突
            </Chip>
          </FilterGroup>
        ) : null}

        {showRisk ? (
          <FilterGroup label="风险类型">
            {(
              [
                ["chase", "追高"],
                ["conflict", "结构冲突"],
                ["earnings", "临近财报"],
                ["incomplete", "数据不完整"],
              ] as const
            ).map(([value, label]) => (
              <Chip
                key={value}
                tone={value === "incomplete" ? "warn" : "default"}
                pressed={filters.riskKind.includes(value)}
                onClick={() =>
                  onChange({
                    ...filters,
                    riskKind: toggle(filters.riskKind, value),
                  })
                }
              >
                {label}
              </Chip>
            ))}
          </FilterGroup>
        ) : null}
      </div>
    </div>
  );
}
