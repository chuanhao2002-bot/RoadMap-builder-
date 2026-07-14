import { AppShell } from "@/components/layout/AppShell";
import { StoreInit } from "@/components/StoreInit";
import { AuthGate } from "@/components/auth/AuthGate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <StoreInit />
      <AppShell>{children}</AppShell>
    </AuthGate>
  );
}
