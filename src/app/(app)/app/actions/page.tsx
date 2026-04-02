import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CheckSquare } from "lucide-react";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <PageHeader
        title="Actions"
        description="Upcoming tasks and reminders."
      />
      <EmptyState
        icon={CheckSquare}
        title="No action items"
        description="Action items will appear here as you create them for your applications."
      />
    </div>
  );
}
