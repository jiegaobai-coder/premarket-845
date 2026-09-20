"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

function chipClass(pressed: boolean, tone: "default" | "warn" | "up" | "down") {
  return cn(
    "inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium transition-colors",
    pressed
      ? tone === "warn"
        ? "border-[var(--pending)] bg-[var(--pending)]/20 text-[var(--pending)]"
        : tone === "up"
          ? "border-[var(--up)] bg-[var(--up)]/15 text-[var(--up)]"
          : tone === "down"
            ? "border-[var(--down)] bg-[var(--down)]/15 text-[var(--down)]"
            : "border-[var(--tos-orange)] bg-[var(--tos-orange)]/20 text-[var(--tos-orange)]"
      : "border-white/25 bg-black/30 text-foreground/75 hover:border-white/40 hover:text-foreground",
  );
}

export function Chip({
  pressed,
  onClick,
  href,
  children,
  tone = "default",
  testId,
}: {
  pressed: boolean;
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
  tone?: "default" | "warn" | "up" | "down";
  testId?: string;
}) {
  const className = chipClass(pressed, tone);
  if (href) {
    return (
      <Link
        href={href}
        scroll={false}
        aria-pressed={pressed}
        data-testid={testId}
        className={className}
      >
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={pressed}
      data-testid={testId}
      onClick={onClick}
      className={className}
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
