import Link from "next/link";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

function readable(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function AdminActivityPage() {
  await requireAdmin();
  const entries = await db.query.auditLogs.findMany({
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    limit: 100,
    with: { admin: true },
  });

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Workspace history</p><h1 className="mt-2 font-serif text-4xl tracking-tight text-[#203a2b]">Activity log</h1><p className="mt-2 text-sm text-[#758078]">A record of important changes made in the seller workspace.</p></div>
      <span className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#68766c]">Latest {entries.length} activities</span>
    </div>
    <section className="mt-8 overflow-hidden rounded-2xl border border-[#e4e8e1] bg-white">
      {entries.length === 0 ? <div className="px-6 py-16 text-center"><p className="font-serif text-2xl text-[#405447]">No activity recorded yet</p><p className="mt-2 text-sm text-[#758078]">Important seller actions will appear here as the store is managed.</p></div> :
        <div className="divide-y divide-[#edf0ea]">{entries.map((entry) => {
          const metadata = entry.metadata && typeof entry.metadata === "object" ? JSON.stringify(entry.metadata) : "";
          const target = entry.entityType === "order" && entry.entityId ? "/admin/orders/" + entry.entityId : entry.entityType === "product" && entry.entityId ? "/admin/products/" + entry.entityId : null;
          return <article key={entry.id} className="grid gap-3 px-6 py-5 sm:grid-cols-[1fr_auto] sm:items-start">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#304236]">{readable(entry.action)}</p>
              <p className="mt-1 text-xs text-[#849087]">{readable(entry.entityType)}{entry.entityId ? " · " + entry.entityId : ""} · {entry.admin?.email ?? "System"}</p>
              {metadata && <p className="mt-3 break-words rounded-lg bg-[#f7f8f5] px-3 py-2 text-xs leading-5 text-[#68766c]">{metadata}</p>}
              {target && <Link href={target} className="mt-3 inline-flex text-xs font-semibold text-[#41684d] hover:underline">Open related record ↗</Link>}
            </div>
            <time dateTime={entry.createdAt.toISOString()} className="text-[11px] text-[#9aa49a] sm:text-right">{new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeStyle: "short" }).format(entry.createdAt)}</time>
          </article>;
        })}</div>}
    </section>
  </div>;
}
