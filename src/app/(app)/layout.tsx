import { AppShell } from "@/components/layout/AppShell";
import { StoreInit } from "@/components/StoreInit";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreInit />
      <AppShell>{children}</AppShell>
    </>
  );
}
