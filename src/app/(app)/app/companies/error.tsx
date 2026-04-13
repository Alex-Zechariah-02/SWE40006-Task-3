"use client";

import { ErrorState } from "@/components/shared/ErrorState";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-5">
      <ErrorState
        title="Failed to load companies"
        message="There was a problem loading your companies."
        onRetry={reset}
      />
    </div>
  );
}
