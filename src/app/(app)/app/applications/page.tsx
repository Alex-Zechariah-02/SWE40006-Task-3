import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { FileText } from "lucide-react";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <PageHeader
        title="Applications"
        description="Track your active and past applications."
      />
      <EmptyState
        icon={FileText}
        title="No applications yet"
        description="Applications will appear here once you start tracking them."
      />
    </div>
  );
}
