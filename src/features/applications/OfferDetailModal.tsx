"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const INPUT_CLASSES =
  "h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

type OfferDetail = {
  id: string;
  offeredDate: string | null;
  compensationNote: string | null;
  responseDeadline: string | null;
  decisionStatus: string;
  notes: string | null;
};

export function OfferDetailModal({
  applicationId,
  offerDetail,
  open,
  onOpenChange,
}: {
  applicationId: string;
  offerDetail: OfferDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const isEditing = !!offerDetail;

  const offeredDateStr = offerDetail?.offeredDate
    ? new Date(offerDetail.offeredDate).toISOString().split("T")[0]
    : "";
  const responseDeadlineStr = offerDetail?.responseDeadline
    ? new Date(offerDetail.responseDeadline).toISOString().split("T")[0]
    : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = new FormData(e.currentTarget);

    const body: Record<string, unknown> = {
      offeredDate: form.get("offeredDate") || undefined,
      responseDeadline: form.get("responseDeadline") || undefined,
      decisionStatus: form.get("decisionStatus") || undefined,
      compensationNote: form.get("compensationNote") || undefined,
      notes: form.get("notes") || undefined,
    };

    try {
      const res = await fetch(`/api/applications/${applicationId}/offer`, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error?.message || "Failed to save.");
        return;
      }

      toast.success(isEditing ? "Updated." : "Saved.");
      onOpenChange(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Offer Detail" : "Add Offer Detail"}
          </DialogTitle>
          <DialogDescription>
            Record the offer outcome and decision for this application.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="offer-offeredDate">Offered date</Label>
              <input
                id="offer-offeredDate"
                name="offeredDate"
                type="date"
                defaultValue={offeredDateStr}
                data-slot="input"
                className={cn(INPUT_CLASSES)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="offer-responseDeadline">Response deadline</Label>
              <input
                id="offer-responseDeadline"
                name="responseDeadline"
                type="date"
                defaultValue={responseDeadlineStr}
                data-slot="input"
                className={cn(INPUT_CLASSES)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="offer-decisionStatus">Decision status</Label>
            <input
              id="offer-decisionStatus"
              name="decisionStatus"
              required={!isEditing}
              maxLength={100}
              defaultValue={offerDetail?.decisionStatus ?? ""}
              placeholder="e.g. Pending, Accepted, Declined"
              data-slot="input"
              className={cn(INPUT_CLASSES)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="offer-compensationNote">Compensation</Label>
            <Textarea
              id="offer-compensationNote"
              name="compensationNote"
              rows={3}
              maxLength={5000}
              defaultValue={offerDetail?.compensationNote ?? ""}
              placeholder="Optional notes about compensation..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="offer-notes">Notes</Label>
            <Textarea
              id="offer-notes"
              name="notes"
              rows={3}
              maxLength={5000}
              defaultValue={offerDetail?.notes ?? ""}
              placeholder="Optional notes..."
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
