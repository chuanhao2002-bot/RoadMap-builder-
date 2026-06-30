import { PresentationMode } from "@/components/presentation/PresentationMode";
import { StoreInit } from "@/components/StoreInit";

export default function PresentPage() {
  return (
    <>
      <StoreInit />
      <PresentationMode />
    </>
  );
}
