import ThemeToggle from "@/components/ThemeToggle";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
          App-level preferences live here so the main trading workflow can stay focused.
        </p>
      </section>

      <section className="space-y-4 border-t border-[var(--border)] pt-6">
        <div>
          <h2 className="text-base font-semibold">Theme</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Switch between the current dark and light themes.
          </p>
        </div>
        <ThemeToggle />
      </section>

      <section className="space-y-3 border-t border-[var(--border)] pt-6">
        <div>
          <h2 className="text-base font-semibold">Accounts</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Account management will live here once account-scoped imports and reports are wired in.
          </p>
        </div>
        <div className="grid gap-2 text-sm text-[var(--muted)]">
          <span>Live Account</span>
          <span>Paper Trading</span>
          <span>Roth IRA</span>
        </div>
      </section>
    </div>
  );
}
