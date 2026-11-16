import "server-only";

import { createHash } from "node:crypto";
import { and, count, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export async function consumeRateLimit({
  action,
  clientAddress,
  limit,
  windowMs,
}: {
  action: string;
  clientAddress: string;
  limit: number;
  windowMs: number;
}) {
  const bucket = createHash("sha256")
    .update(action + ":" + clientAddress + ":" + (process.env.SESSION_SECRET ?? "local-only"))
    .digest("hex");
  const since = new Date(Date.now() - windowMs);

  return db.transaction(async (tx) => {
    await tx.delete(auditLogs).where(and(
      eq(auditLogs.entityType, "rate_limit"),
      lt(auditLogs.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)),
    ));
    // Serialize checks for the same hashed client bucket so parallel requests
    // cannot all pass the limit at once.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${bucket}, 0))`);
    const [recent] = await tx.select({ total: count() }).from(auditLogs).where(and(
      eq(auditLogs.action, action),
      eq(auditLogs.entityType, "rate_limit"),
      eq(auditLogs.entityId, bucket),
      gte(auditLogs.createdAt, since),
    ));
    if (Number(recent?.total ?? 0) >= limit) return false;

    await tx.insert(auditLogs).values({
      action,
      entityType: "rate_limit",
      entityId: bucket,
      metadata: {},
    });
    return true;
  });
}

export function getClientAddress(headers: Headers) {
  return (
    headers.get("x-vercel-forwarded-for") ??
    headers.get("x-forwarded-for") ??
    "unknown"
  ).split(",")[0].trim().slice(0, 80);
}
