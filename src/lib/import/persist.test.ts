import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { beforeAll, describe, expect, it } from "vitest";

const SAMPLE = "data/samples/2026-03-04-AccountStatement.csv";

function hasSample(): boolean {
  try {
    readFileSync(SAMPLE);
    return true;
  } catch {
    return false;
  }
}

describe.runIf(hasSample())("importTosCsv (integration)", () => {
  let mod: typeof import("./persist");
  let csv: string;

  beforeAll(async () => {
    const dir = mkdtempSync(join(tmpdir(), "tj-"));
    process.env.DB_PATH = join(dir, "test.db");
    const raw = new Database(process.env.DB_PATH);
    for (const f of readdirSync("drizzle")
      .filter((n) => n.endsWith(".sql"))
      .sort()) {
      raw.exec(readFileSync(join("drizzle", f), "utf8"));
    }
    raw.close();
    csv = readFileSync(SAMPLE, "utf8");
    mod = await import("./persist");
  });

  it("inserts executions + trades, then is idempotent on re-import", () => {
    const first = mod.importTosCsv(csv, "sample.csv", 1);
    expect(first.parsed).toBe(91);
    expect(first.inserted).toBe(91);
    expect(first.duplicates).toBe(0);
    expect(first.trades).toBe(31);

    const second = mod.importTosCsv(csv, "sample.csv", 1);
    expect(second.inserted).toBe(0);
    expect(second.duplicates).toBe(91);
    expect(second.trades).toBe(0);
  });
});
