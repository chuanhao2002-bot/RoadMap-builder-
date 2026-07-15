"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/siteUrl";

type Mode = "password" | "magic";

export function AuthForm({ title, subtitle }: { title: string; subtitle: string }) {
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const reset = () => {
    setError(null);
    setInfo(null);
  };

  const signIn = async () => {
    if (!email.trim() || !password) return;
    setBusy(true);
    reset();
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (signInError) {
      console.error("signInWithPassword failed", signInError);
      setError(signInError.message || "Could not sign in.");
    }
    // On success, the onAuthStateChange listener re-renders the parent.
  };

  const signUp = async () => {
    if (!email.trim() || !password) return;
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    reset();
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (signUpError) {
      console.error("signUp failed", signUpError);
      setError(signUpError.message || "Could not create the account.");
      return;
    }
    if (!data.session) {
      // Email confirmation is enabled on the Supabase project.
      setInfo("Account created. Check your email to confirm, then sign in.");
    }
    // If a session was returned, the parent re-renders automatically.
  };

  const sendMagic = async () => {
    if (!email.trim()) return;
    setBusy(true);
    reset();
    const supabase = createClient();
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${getSiteUrl()}${path}` },
    });
    setBusy(false);
    if (otpError) {
      console.error("signInWithOtp failed", otpError);
      setError(otpError.message || "Could not send the sign-in link.");
      return;
    }
    setInfo(`Check ${email} for a sign-in link.`);
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
      />

      {mode === "password" && (
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") signIn();
          }}
          placeholder="Password"
          autoComplete="current-password"
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      )}

      {mode === "password" ? (
        <div className="space-y-2">
          <button
            onClick={signIn}
            disabled={busy || !email.trim() || !password}
            className="w-full rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Please wait…" : "Sign in"}
          </button>
          <button
            onClick={signUp}
            disabled={busy || !email.trim() || !password}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50"
          >
            Create account
          </button>
        </div>
      ) : (
        <button
          onClick={sendMagic}
          disabled={busy || !email.trim()}
          className="w-full rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send magic link"}
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      {info && <p className="text-xs text-emerald-600 dark:text-emerald-400">{info}</p>}

      <button
        onClick={() => {
          setMode((m) => (m === "password" ? "magic" : "password"));
          reset();
        }}
        className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline"
      >
        {mode === "password" ? "Use a magic link instead" : "Use email + password instead"}
      </button>
    </div>
  );
}
