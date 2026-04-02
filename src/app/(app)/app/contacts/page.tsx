import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Users } from "lucide-react";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <PageHeader
        title="Contacts"
        description="People you have connected with."
      />
      <EmptyState
        icon={Users}
        title="No contacts yet"
        description="Contacts will appear here as you add them to companies or applications."
      />
    </div>
  );
}
