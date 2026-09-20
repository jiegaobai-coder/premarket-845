import { BriefingBoard } from "@/components/briefing-board";

export default async function Page({ searchParams }: PageProps<"/">) {
  const query = await searchParams;
  const tab = typeof query.tab === "string" ? query.tab : undefined;
  const oi = typeof query.oi === "string" ? query.oi : undefined;
  const universe = typeof query.universe === "string" ? query.universe : undefined;
  return (
    <BriefingBoard initialTab={tab} initialOi={oi} initialUniverse={universe} />
  );
}
