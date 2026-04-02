import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Building2 } from "lucide-react";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <PageHeader
        title="Companies"
        description="Companies you have interacted with."
      />
      <EmptyState
        icon={Building2}
        title="No companies yet"
        description="Companies will appear here as you track opportunities and applications."
      />
    </div>
  );
}
