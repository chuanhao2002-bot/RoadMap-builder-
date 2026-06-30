import { PresentationMode } from "@/components/presentation/PresentationMode";
import { AuthGate } from "@/components/auth/AuthGate";

export default function PresentPage() {
  return (
    <AuthGate>
      <PresentationMode />
    </AuthGate>
  );
}
