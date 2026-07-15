"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/useSession";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { AuthForm } from "@/components/auth/AuthForm";

export default function JoinPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { user, loading } = useSession();
  const acceptInvite = useWorkspaceStore((s) => s.acceptInvite);

  const [status, setStatus] = useState<"idle" | "joined" | "error">("idle");
  const attempted = useRef(false);

  useEffect(() => {
    if (loading || !user || attempted.current) return;
    attempted.current = true;
    acceptInvite(params.token, user.id).then((ok) => {
      setStatus(ok ? "joined" : "error");
      if (ok) setTimeout(() => router.push("/"), 1200);
    });
  }, [loading, user, params.token, acceptInvite, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <AuthForm title="Join workspace" subtitle="Sign in or create an account to accept this invite." />
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
