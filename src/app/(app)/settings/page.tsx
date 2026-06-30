"use client";

import { useSupabaseUser } from "@/lib/useSupabaseUser";

export default function SettingsPage() {
  const { user, loading } = useSupabaseUser();
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
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">Signed in as</span>
          <span className="font-medium">{loading ? "…" : user?.email ?? "Not signed in"}</span>
        </div>
      </div>
      <p className="text-sm text-neutral-500">
        Projects and saved views are persisted to Supabase Postgres, scoped to your account via
        row-level security. See README for the roadmap of remaining collaboration work.
      </p>
    </div>
  );
}
