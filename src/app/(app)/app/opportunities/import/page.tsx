import { PageHeader } from "@/components/shared/PageHeader";
import { PendingImportRunner } from "@/features/search/PendingImportRunner";
import { PageContainer } from "@/components/shared/PageContainer";

export default function Page() {
  return (
    <PageContainer width="default">
      <PageHeader
        title="Import"
        description="Import an opportunity from search results."
      />
      <PendingImportRunner />
    </PageContainer>
  );
}
