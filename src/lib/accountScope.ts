import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { ACTIVE_ACCOUNT_ID_COOKIE } from "@/lib/accounts";

export type AccountOption = typeof schema.accounts.$inferSelect;

export async function listAccounts(): Promise<AccountOption[]> {
  const accounts = await db.select().from(schema.accounts).orderBy(schema.accounts.id);
  if (accounts.length > 0) return accounts;

  const account = await db
    .insert(schema.accounts)
    .values({ name: "Live Account" })
    .returning()
    .get();
  return [account];
}

export async function getActiveAccount(existingAccounts?: AccountOption[]): Promise<AccountOption> {
  const accounts = existingAccounts ?? await listAccounts();
  const cookieStore = await cookies();
  const cookieId = Number(cookieStore.get(ACTIVE_ACCOUNT_ID_COOKIE)?.value);
  return accounts.find((item) => item.id === cookieId) ?? accounts[0];
}

export async function setActiveAccount(accountId: number) {
  const account = (
    await db.select().from(schema.accounts).where(eq(schema.accounts.id, accountId)).limit(1)
  )[0];
  if (!account) return null;

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ACCOUNT_ID_COOKIE, String(account.id), {
    path: "/",
    sameSite: "lax",
  });
  return account;
}
