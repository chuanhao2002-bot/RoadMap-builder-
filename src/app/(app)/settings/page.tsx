"use client";

export default function SettingsPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="space-y-2 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">Supabase URL</span>
          <span className="font-medium">{url ? url : "Not set"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">Publishable key</span>
          <span className="font-medium">{hasKey ? "Set" : "Not set"}</span>
        </div>
      </div>
      <p className="text-sm text-neutral-500">
        Projects and saved views are persisted to a shared Supabase Postgres database with no
        sign-in required. Anyone with access to this app can see and edit the same data.
      </p>
    </div>
  );
}
