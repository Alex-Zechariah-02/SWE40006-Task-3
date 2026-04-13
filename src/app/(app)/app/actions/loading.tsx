import { SkeletonList } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-[var(--spacing-cd-7)]">
      <SkeletonList />
    </div>
  );
}
