"use client";

import { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { createSnapshot } from "@/lib/snapshots";
import { Link2, Check, UserPlus } from "lucide-react";

export default function SettingsPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const projects = useProjectStore((s) => s.projects);
  const { workspaces, currentWorkspaceId, createInvite } = useWorkspaceStore();
  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);

  const [name, setName] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [invitingBusy, setInvitingBusy] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const id = await createSnapshot(name.trim() || "Untitled snapshot", projects);
      setShareUrl(`${window.location.origin}/share/${id}`);
    } catch {
      setError("Failed to create snapshot — try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleInvite = async () => {
    setInvitingBusy(true);
    const token = await createInvite(inviteEmail);
    setInvitingBusy(false);
    if (token) setInviteUrl(`${window.location.origin}/join/${token}`);
  };

  const handleCopyInvite = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 1500);
  };

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
        Projects, to-dos, and saved views are scoped to your current workspace
        {currentWorkspace ? ` ("${currentWorkspace.name}")` : ""}. Only people you invite into this
        workspace can see or edit its data.
      </p>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        <h2 className="text-sm font-semibold">Invite a teammate</h2>
        <p className="text-xs text-neutral-500">
          Generate a one-time join link for {currentWorkspace?.name ?? "this workspace"}. Send it to
          whoever you want to give access — they sign in with their own email and land in the same
          workspace as you.
        </p>
        <div className="flex items-center gap-2">
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Email (optional, for your reference)"
            className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-sm"
          />
          <button
            onClick={handleInvite}
            disabled={invitingBusy || !currentWorkspaceId}
            className="flex items-center gap-1.5 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <UserPlus size={14} /> {invitingBusy ? "Creating..." : "Create invite link"}
          </button>
        </div>
        {inviteUrl && (
          <div className="flex items-center gap-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2 py-1.5 text-sm">
            <span className="flex-1 truncate">{inviteUrl}</span>
            <button
              onClick={handleCopyInvite}
              className="flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
            >
              {inviteCopied ? <Check size={14} /> : <Link2 size={14} />}
              {inviteCopied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        <h2 className="text-sm font-semibold">Shareable read-only snapshot</h2>
        <p className="text-xs text-neutral-500">
          Freeze the current {projects.length} project(s) into a public, read-only link — separate
          from workspace access, anyone with the link can view it (no sign-in required). The
          snapshot won&apos;t change even if the live data changes later.
        </p>
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Snapshot name (e.g. Q3 Committed Plan)"
            className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-sm"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-1.5 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Link2 size={14} /> {creating ? "Creating..." : "Create link"}
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {shareUrl && (
          <div className="flex items-center gap-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2 py-1.5 text-sm">
            <span className="flex-1 truncate">{shareUrl}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
            >
              {copied ? <Check size={14} /> : <Link2 size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
