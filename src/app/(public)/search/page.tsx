import { SearchSurface } from "@/components/public/SearchSurface";
import { PageContainer } from "@/components/shared/PageContainer";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = (await searchParams) ?? {};
  const qRaw = resolved.q;
  const q = Array.isArray(qRaw) ? qRaw[0] : qRaw;

  return (
    <PageContainer width="default">
      <h1 className="type-h1 font-display font-semibold mb-6 text-balance">
        Search opportunities
      </h1>
      <SearchSurface initialQuery={typeof q === "string" ? q : undefined} />
    </PageContainer>
  );
}
