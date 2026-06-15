"use server";

import { revalidatePath } from "next/cache";
import { getActiveAccount } from "@/lib/accountScope";
import { importTosCsv, type ImportSummary } from "@/lib/import/persist";

export type ImportState =
  | { ok: true; summary: ImportSummary }
  | { ok: false; error: string }
  | null;

export async function importTosAction(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a ThinkorSwim Account Statement CSV." };
  }
  try {
    const csv = await file.text();
    const account = await getActiveAccount();
    const summary = await importTosCsv(csv, file.name, account.id);
    revalidatePath("/trades");
    revalidatePath("/calendar");
    revalidatePath("/reports");
    revalidatePath("/journal");
    revalidatePath("/");
    return { ok: true, summary };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Import failed.",
    };
  }
}
