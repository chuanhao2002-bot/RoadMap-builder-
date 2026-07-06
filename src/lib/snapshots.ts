import { createClient } from "@/lib/supabase";
import type { Project } from "@/types/project";

export interface Snapshot {
  id: string;
  name: string;
  createdAt: string;
  projects: Project[];
}

interface SnapshotRow {
  id: string;
  name: string;
  created_at: string;
  data: Project[];
}

export async function createSnapshot(name: string, projects: Project[]): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("snapshots")
    .insert({ name, data: projects })
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error("Failed to create snapshot");
  return data.id as string;
}

export async function getSnapshot(id: string): Promise<Snapshot | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("snapshots").select("*").eq("id", id).single();
  if (error || !data) return null;
  const row = data as SnapshotRow;
  return { id: row.id, name: row.name, createdAt: row.created_at, projects: row.data };
}
