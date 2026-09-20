"use client";

import { cn } from "@/lib/utils";

export function Chip({
  pressed,
  onClick,
  children,
  tone = "default",
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "warn" | "up" | "down";
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "h-7 rounded-md border px-2.5 text-xs font-medium transition-colors",
        pressed
          ? tone === "warn"
            ? "border-[var(--pending)] bg-[var(--pending)]/20 text-[var(--pending)]"
            : tone === "up"
              ? "border-[var(--up)] bg-[var(--up)]/15 text-[var(--up)]"
              : tone === "down"
                ? "border-[var(--down)] bg-[var(--down)]/15 text-[var(--down)]"
                : "border-[var(--tos-orange)] bg-[var(--tos-orange)]/20 text-[var(--tos-orange)]"
          : "border-white/10 bg-white/3 text-muted-foreground hover:border-white/20 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
