import { Archive, FileText } from "lucide-react";

import { briefing } from "@/data/briefing";

export function ArchiveBoard() {
  const item = briefing.archive;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header>
        <div className="text-[11px] tracking-[0.22em] text-[var(--tos-orange)] uppercase">
          Home · 存档
        </div>
        <h1 className="mt-1 font-heading text-2xl font-semibold">每天的 PDF 只作摘要</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          盘前主入口是 8:45 分析页。这里保留 Schwab 期权历史 PDF，方便核对原始成交，而不是继续从文件顶部读到尾。
        </p>
      </header>

      <article className="rounded-xl border border-white/10 bg-[var(--panel)] p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-black/30">
            <FileText className="size-5 text-[var(--tos-orange)]" />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-sm">{item.filename}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              生成于 {item.generatedAt} · 已解析进盘前页
            </div>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-lg bg-black/20 py-3">
            <dt className="text-[11px] text-muted-foreground">标的</dt>
            <dd className="mt-1 font-mono">{item.symbolCount}</dd>
          </div>
          <div className="rounded-lg bg-black/20 py-3">
            <dt className="text-[11px] text-muted-foreground">OI 已更新</dt>
            <dd className="mt-1 font-mono text-[var(--up)]">{item.oiUpdated}</dd>
          </div>
          <div className="rounded-lg bg-black/20 py-3">
            <dt className="text-[11px] text-muted-foreground">尚未更新</dt>
            <dd className="mt-1 font-mono text-[var(--pending)]">{item.oiPending}</dd>
          </div>
        </dl>

        <p className="mt-4 text-sm leading-6 text-foreground/90">{item.summary}</p>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          源路径：C:\Users\gaoji\OneDrive\Documents\TOS\{item.filename}
          。8:45 是每天打开来看的时刻；换了新的一天 PDF 并写进数据后，存档才会多一条。
        </p>
      </article>

      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Archive className="mt-0.5 size-4 shrink-0" />
        还没有更早的日期。新的一天进来后，这里会按日期往下堆，首页始终停在最新一次 8:45。
      </div>
    </div>
  );
}
