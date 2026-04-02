import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Download } from "lucide-react";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <PageHeader
        title="Import"
        description="Import an opportunity from search results."
      />
      <EmptyState
        icon={Download}
        title="Nothing to import"
        description="Use the search page to find and import opportunities."
      />
    </div>
  );
}
