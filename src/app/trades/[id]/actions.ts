"use server";

import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { getActiveAccount } from "@/lib/accountScope";
import {
  EMOTION_PILLS,
  PRIMARY_TRADE_LABELS,
  PROCESS_PILLS,
  encodeJournalTags,
  filterKnownJournalTags,
} from "@/lib/journalLabels";

export async function addTradeNoteAction(formData: FormData) {
  const tradeId = Number(formData.get("tradeId"));
  const note = String(formData.get("note") ?? "").trim();
  const primaryLabel = String(formData.get("primaryLabel") ?? "").trim();
  const processTags = filterKnownJournalTags(formData.getAll("processTags"), PROCESS_PILLS);
  const emotionTags = filterKnownJournalTags(formData.getAll("emotionTags"), EMOTION_PILLS);
  const validPrimaryLabel = PRIMARY_TRADE_LABELS.some((option) => option.value === primaryLabel)
    ? primaryLabel
    : "";

  if (
    !Number.isInteger(tradeId) ||
    tradeId <= 0 ||
    (!note && !validPrimaryLabel && processTags.length === 0 && emotionTags.length === 0)
  ) {
    return;
  }
  const activeAccount = await getActiveAccount();

  await db.insert(schema.journalEntries).values({
    accountId: activeAccount.id,
    tradeId,
    lessons: note || null,
    emotionalState: validPrimaryLabel || null,
    whatWentWell: encodeJournalTags(processTags),
    whatWentWrong: encodeJournalTags(emotionTags),
  });

  revalidatePath(`/trades/${tradeId}`);
  revalidatePath("/journal");
}
