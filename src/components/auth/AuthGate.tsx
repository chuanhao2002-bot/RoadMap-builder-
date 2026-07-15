"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useSession } from "@/lib/useSession";
import { getSiteUrl } from "@/lib/siteUrl";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendLink = async () => {
    if (!email.trim()) return;
    setSending(true);
    setError(null);
    const supabase = createClient();
    const { error: sendError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${getSiteUrl()}${window.location.pathname}` },
    });
    setSending(false);
    if (sendError) {
      console.error("signInWithOtp failed", sendError);
      setError(sendError.message || "Could not send the sign-in link — try again.");
      return;
    }
    setSent(true);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4">
          <div>
            <h1 className="text-xl font-semibold">Roadmap Studio</h1>
            <p className="text-sm text-neutral-500 mt-1">Sign in with a magic link to continue.</p>
          </div>
          {sent ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Check {email} for a sign-in link.
            </p>
          ) : (
            <>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendLink();
                }}
                placeholder="you@example.com"
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
              />
              <button
                onClick={handleSendLink}
                disabled={sending || !email.trim()}
                className="w-full rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send magic link"}
              </button>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
