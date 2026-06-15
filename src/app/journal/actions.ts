"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getActiveAccount } from "@/lib/accountScope";
import { db, schema } from "@/lib/db";
import {
  EMOTION_PILLS,
  PRIMARY_TRADE_LABELS,
  PROCESS_PILLS,
  encodeJournalTags,
  filterKnownJournalTags,
} from "@/lib/journalLabels";

type ScopedNoteState = { ok: boolean };
type TradeNoteState = { ok: boolean };
const RECAP_SCOPES = ["day", "week", "month"] as const;
type RecapScope = (typeof RECAP_SCOPES)[number];

/** Create-or-update a scoped recap note (day/week/month) keyed by scope+scopeKey. */
export async function upsertScopedNoteAction(
  _prev: ScopedNoteState | null,
  formData: FormData,
): Promise<ScopedNoteState> {
  const scope = String(formData.get("scope") ?? "") as RecapScope;
  const scopeKey = String(formData.get("scopeKey") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!RECAP_SCOPES.includes(scope) || !scopeKey) return { ok: false };
  const activeAccount = await getActiveAccount();

  const existing = await db
    .select({ id: schema.journalEntries.id })
    .from(schema.journalEntries)
    .where(
      and(
        eq(schema.journalEntries.scope, scope),
        eq(schema.journalEntries.scopeKey, scopeKey),
        eq(schema.journalEntries.accountId, activeAccount.id),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(schema.journalEntries)
      .set({ lessons: body || null })
      .where(eq(schema.journalEntries.id, existing[0].id));
  } else {
    await db
      .insert(schema.journalEntries)
      .values({ accountId: activeAccount.id, scope, scopeKey, lessons: body || null });
  }

  revalidatePath("/journal");
  return { ok: true };
}

export async function updateJournalEntryAction(formData: FormData) {
  const noteId = Number(formData.get("noteId"));
  const tradeId = Number(formData.get("tradeId"));
  const note = String(formData.get("note") ?? "").trim();
  const primaryLabel = String(formData.get("primaryLabel") ?? "").trim();
  const processTags = filterKnownJournalTags(formData.getAll("processTags"), PROCESS_PILLS);
  const emotionTags = filterKnownJournalTags(formData.getAll("emotionTags"), EMOTION_PILLS);
  const validPrimaryLabel = PRIMARY_TRADE_LABELS.some((option) => option.value === primaryLabel)
    ? primaryLabel
    : "";

  if (!Number.isInteger(noteId) || noteId <= 0) return;

  await db
    .update(schema.journalEntries)
    .set({
      lessons: note || null,
      emotionalState: validPrimaryLabel || null,
      whatWentWell: encodeJournalTags(processTags),
      whatWentWrong: encodeJournalTags(emotionTags),
    })
    .where(eq(schema.journalEntries.id, noteId));

  revalidatePath("/journal");
  if (Number.isInteger(tradeId) && tradeId > 0) {
    revalidatePath(`/trades/${tradeId}`);
  }
}

export async function deleteJournalEntryAction(formData: FormData) {
  const noteId = Number(formData.get("noteId"));
  const tradeId = Number(formData.get("tradeId"));

  if (!Number.isInteger(noteId) || noteId <= 0) return;

  await db
    .delete(schema.journalEntries)
    .where(eq(schema.journalEntries.id, noteId));

  revalidatePath("/journal");
  if (Number.isInteger(tradeId) && tradeId > 0) {
    revalidatePath(`/trades/${tradeId}`);
  }
}

export async function updateJournalEntryStateAction(
  _prev: TradeNoteState | null,
  formData: FormData,
): Promise<TradeNoteState> {
  await updateJournalEntryAction(formData);
  return { ok: true };
}
