import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <PageHeader
        title="Dashboard"
        description="Your career pipeline at a glance."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications" value="--" />
        <StatCard label="Interviews" value="--" />
        <StatCard label="Saved" value="--" />
        <StatCard label="Actions" value="--" />
      </div>
    </div>
  );
}
