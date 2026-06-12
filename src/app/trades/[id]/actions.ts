"use server";

import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";

export async function addTradeNoteAction(formData: FormData) {
  const tradeId = Number(formData.get("tradeId"));
  const note = String(formData.get("note") ?? "").trim();
  const emotionalState = String(formData.get("emotionalState") ?? "").trim();

  if (!Number.isInteger(tradeId) || tradeId <= 0 || (!note && !emotionalState)) {
    return;
  }

  await db.insert(schema.journalEntries).values({
    tradeId,
    lessons: note || null,
    emotionalState: emotionalState || null,
  });

  revalidatePath(`/trades/${tradeId}`);
  revalidatePath("/journal");
}
