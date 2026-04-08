import { SearchSurface } from "@/components/public/SearchSurface";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = (await searchParams) ?? {};
  const qRaw = resolved.q;
  const q = Array.isArray(qRaw) ? qRaw[0] : qRaw;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="type-h1 font-semibold mb-6 text-balance">
        Search opportunities
      </h1>
      <SearchSurface initialQuery={typeof q === "string" ? q : undefined} />
    </div>
  );
}
