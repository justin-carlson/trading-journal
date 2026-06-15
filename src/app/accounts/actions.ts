"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { getActiveAccount, setActiveAccount } from "@/lib/accountScope";

function revalidateAccountViews() {
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/trades");
  revalidatePath("/journal");
  revalidatePath("/reports");
  revalidatePath("/settings");
}

export async function selectAccountAction(formData: FormData) {
  const accountId = Number(formData.get("accountId"));
  if (!Number.isInteger(accountId) || accountId <= 0) return;
  await setActiveAccount(accountId);
  revalidateAccountViews();
}

export async function addAccountAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const account = await db
    .insert(schema.accounts)
    .values({ name })
    .onConflictDoNothing()
    .returning({ id: schema.accounts.id })
    .get();

  if (account) await setActiveAccount(account.id);
  revalidateAccountViews();
}

export async function renameAccountAction(formData: FormData) {
  const accountId = Number(formData.get("accountId"));
  const name = String(formData.get("name") ?? "").trim();
  if (!Number.isInteger(accountId) || accountId <= 0 || !name) return;

  await db
    .update(schema.accounts)
    .set({ name })
    .where(eq(schema.accounts.id, accountId));
  revalidateAccountViews();
}

export async function deleteAccountAction(formData: FormData) {
  const accountId = Number(formData.get("accountId"));
  if (!Number.isInteger(accountId) || accountId <= 0) return;

  const accounts = await db.select().from(schema.accounts).orderBy(schema.accounts.id);
  if (accounts.length <= 1) return;

  const activeAccount = await getActiveAccount();
  const [tradeRows, executionRows, importRows, journalRows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.trades)
      .where(eq(schema.trades.accountId, accountId)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.executions)
      .where(eq(schema.executions.accountId, accountId)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.importBatches)
      .where(eq(schema.importBatches.accountId, accountId)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.journalEntries)
      .where(eq(schema.journalEntries.accountId, accountId)),
  ]);
  const ownedRowCount =
    (tradeRows[0]?.count ?? 0) +
    (executionRows[0]?.count ?? 0) +
    (importRows[0]?.count ?? 0) +
    (journalRows[0]?.count ?? 0);
  if (ownedRowCount > 0) return;

  await db.delete(schema.accounts).where(eq(schema.accounts.id, accountId));

  if (activeAccount.id === accountId) {
    const remaining = await db.select().from(schema.accounts).orderBy(schema.accounts.id).limit(1);
    if (remaining[0]) await setActiveAccount(remaining[0].id);
  }

  revalidateAccountViews();
}
