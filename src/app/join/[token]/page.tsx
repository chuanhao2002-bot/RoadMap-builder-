"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/useSession";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { createClient } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/siteUrl";

export default function JoinPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { user, loading } = useSession();
  const acceptInvite = useWorkspaceStore((s) => s.acceptInvite);

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "joined" | "error">("idle");
  const [sendError, setSendError] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (loading || !user || attempted.current) return;
    attempted.current = true;
    acceptInvite(params.token, user.id).then((ok) => {
      setStatus(ok ? "joined" : "error");
      if (ok) setTimeout(() => router.push("/"), 1200);
    });
  }, [loading, user, params.token, acceptInvite, router]);

  const handleSendLink = async () => {
    if (!email.trim()) return;
    setSending(true);
    setSendError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${getSiteUrl()}/join/${params.token}` },
    });
    setSending(false);
    if (error) {
      console.error("signInWithOtp failed", error);
      setSendError(error.message || "Could not send the sign-in link — try again.");
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
            <h1 className="text-xl font-semibold">Join workspace</h1>
            <p className="text-sm text-neutral-500 mt-1">Sign in with a magic link to accept this invite.</p>
          </div>
          {sent ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Check {email} for a sign-in link.</p>
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
              {sendError && <p className="text-xs text-red-500">{sendError}</p>}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-sm">
      {status === "joined" && <p className="text-emerald-600 dark:text-emerald-400">Joined! Redirecting…</p>}
      {status === "error" && <p className="text-red-500">This invite link is invalid or has expired.</p>}
      {status === "idle" && <p className="text-neutral-400">Joining workspace…</p>}
    </div>
  );
}
