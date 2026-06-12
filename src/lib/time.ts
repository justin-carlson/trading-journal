/**
 * Timezone helpers (DST-correct via IANA zones).
 *
 * TOS `Exec Time` is wall-clock **Pacific** (America/Los_Angeles). We convert it
 * to a UTC epoch for storage; market-session / display conversion to Eastern is
 * done separately. See DESIGN.md §9 (Timezone).
 */

export const SOURCE_TZ = "America/Los_Angeles"; // TOS export wall-clock zone
export const MARKET_TZ = "America/New_York"; // US equities session zone

type TZParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

/** Break an instant into wall-clock parts in a given IANA zone. */
export function timeZoneParts(ms: number, timeZone: string): TZParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(ms));

  const v = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    year: Number(v.year),
    month: Number(v.month),
    day: Number(v.day),
    hour: Number(v.hour),
    minute: Number(v.minute),
    second: Number(v.second),
  };
}

/**
 * Interpret a wall-clock `YYYY-MM-DD` + `HH:MM:SS` as a time in `timeZone` and
 * return the UTC epoch in milliseconds. Iterative solve handles DST offsets.
 */
export function zonedDateTimeToUtcMs(
  date: string,
  time: string,
  timeZone: string,
): number {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute, second = 0] = time.split(":").map(Number);
  const targetAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  let guess = targetAsUtc;

  for (let i = 0; i < 5; i += 1) {
    const p = timeZoneParts(guess, timeZone);
    const renderedAsUtc = Date.UTC(
      p.year,
      p.month - 1,
      p.day,
      p.hour,
      p.minute,
      p.second,
    );
    const diff = targetAsUtc - renderedAsUtc;
    guess += diff;
    if (diff === 0) break;
  }
  return guess;
}

/** Epoch **seconds** for a Pacific wall-clock TOS timestamp. */
export function tosWallClockToEpochSeconds(date: string, time: string): number {
  return Math.round(zonedDateTimeToUtcMs(date, time, SOURCE_TZ) / 1000);
}

const etDateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: MARKET_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** ET market date (YYYY-MM-DD) for an epoch-seconds instant. */
export function etDateString(epochSeconds: number): string {
  return etDateFmt.format(new Date(epochSeconds * 1000));
}

/** Epoch-seconds bounds [start, endExclusive) of an ET market date. */
export function etDayRange(date: string): { start: number; end: number } {
  const start = Math.round(zonedDateTimeToUtcMs(date, "00:00:00", MARKET_TZ) / 1000);
  // +26h covers DST; callers use it as an upper bound for "same ET day".
  return { start, end: start + 26 * 3600 };
}
