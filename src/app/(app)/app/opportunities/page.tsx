import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Lightbulb } from "lucide-react";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <PageHeader
        title="Opportunities"
        description="Saved opportunities from search."
      />
      <EmptyState
        icon={Lightbulb}
        title="No opportunities saved"
        description="Search for opportunities and save them here to track your pipeline."
      />
    </div>
  );
}
