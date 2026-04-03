import { PageHeader } from "@/components/shared/PageHeader";
import { PendingImportRunner } from "@/features/search/PendingImportRunner";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <PageHeader
        title="Import"
        description="Import an opportunity from search results."
      />
      <PendingImportRunner />
    </div>
  );
}
