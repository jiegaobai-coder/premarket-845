"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, Clock3, Crosshair, Menu } from "lucide-react";
import { useState } from "react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getSession, oiFreshness } from "@/lib/session";

const nav = [
  { href: "/", label: "8:45 盘前", hint: "今天先看谁", icon: Crosshair },
  { href: "/archive", label: "PDF 存档", hint: "当天摘要", icon: Archive },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const session = getSession();
  const fresh = oiFreshness();

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-[var(--tos-orange)] font-heading text-xs font-bold text-black">
            H
          </div>
          <div>
            <div className="text-[11px] tracking-[0.18em] text-[var(--tos-orange)] uppercase">
              Home
            </div>
            <div className="text-sm font-medium text-foreground">8:45 盘前分析</div>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          每天 8:45 打开看。不会到点自动换新数据，名单跟着当天那份 PDF。
        </p>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-[var(--tos-orange)]/15 text-foreground ring-1 ring-[var(--tos-orange)]/40"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              <span className="flex flex-col">
                <span className="font-medium">{item.label}</span>
                <span className="text-[11px] text-muted-foreground">{item.hint}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-white/10 px-4 py-4 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock3 className="size-3.5" />
          {session.asOf}
        </div>
        <div>
          <div className="mb-1 text-[11px] tracking-wide text-muted-foreground uppercase">
            自选
          </div>
          <div className="text-sm text-foreground">{session.watchlist.length} 只</div>
        </div>
        <div>
          <div className="mb-1 text-[11px] tracking-wide text-muted-foreground uppercase">
            今晨 OI
          </div>
          <div className="text-sm">
            <span className="text-[var(--up)]">{fresh.updated} 已更新</span>
            <span className="mx-1.5 text-muted-foreground">·</span>
            <span className="text-[var(--pending)]">{fresh.pending} 尚未更新</span>
          </div>
          {fresh.pendingTickers.length > 0 ? (
            <p className="mt-1 text-[11px] leading-4 text-[var(--pending)]">
              {fresh.pendingTickers.join("、")} 不能当成“没有确认”
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-full bg-background">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 overflow-y-auto border-r border-white/10 bg-[var(--sidebar-bg)] lg:flex lg:flex-col">
        <NavLinks />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#0e1219]/95 px-3 py-2 backdrop-blur lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="打开导航"
              className="inline-flex size-8 items-center justify-center rounded-lg border border-white/20 text-foreground hover:bg-white/5"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <NavLinks onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link
            href="/"
            className={cn(
              "text-sm font-medium",
              pathname === "/" ? "text-[var(--tos-orange)]" : "text-foreground",
            )}
          >
            8:45 盘前
          </Link>
          <Link
            href="/archive"
            className={cn(
              "text-sm",
              pathname === "/archive" ? "text-[var(--tos-orange)]" : "text-muted-foreground",
            )}
          >
            PDF 存档
          </Link>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
