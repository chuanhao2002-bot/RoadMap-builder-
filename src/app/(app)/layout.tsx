import { Sidebar } from "@/components/layout/Sidebar";
import { StoreInit } from "@/components/StoreInit";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreInit />
      <div className="min-h-full flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </>
  );
}
