import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Search } from "lucide-react";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <PageHeader
        title="Search"
        description="Discover opportunities from across the web."
      />
      <EmptyState
        icon={Search}
        title="Start searching"
        description="Enter a query to find internships, graduate programs, and early-career roles."
      />
    </div>
  );
}
