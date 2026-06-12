"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";

export async function updateJournalEntryAction(formData: FormData) {
  const noteId = Number(formData.get("noteId"));
  const tradeId = Number(formData.get("tradeId"));
  const note = String(formData.get("note") ?? "").trim();
  const emotionalState = String(formData.get("emotionalState") ?? "").trim();

  if (!Number.isInteger(noteId) || noteId <= 0) return;

  await db
    .update(schema.journalEntries)
    .set({
      lessons: note || null,
      emotionalState: emotionalState || null,
    })
    .where(eq(schema.journalEntries.id, noteId));

  revalidatePath("/journal");
  if (Number.isInteger(tradeId) && tradeId > 0) {
    revalidatePath(`/trades/${tradeId}`);
  }
}
