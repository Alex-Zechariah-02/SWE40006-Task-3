import { SearchSurface } from "@/components/public/SearchSurface";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="type-h1 font-semibold mb-6 text-balance">
        Search opportunities
      </h1>
      <SearchSurface />
    </div>
  );
}
