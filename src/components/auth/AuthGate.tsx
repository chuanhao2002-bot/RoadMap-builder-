"use client";

import { useSession } from "@/lib/useSession";
import { AuthForm } from "@/components/auth/AuthForm";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <AuthForm title="Roadmap Studio" subtitle="Sign in to continue." />
      </div>
    );
  }

  return <>{children}</>;
}
