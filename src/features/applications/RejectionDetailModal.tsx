"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type RejectionDetail = {
  id: string;
  rejectionDate: string | null;
  rejectedAtStage: string;
  notes: string | null;
};

export function RejectionDetailModal({
  applicationId,
  rejectionDetail,
  open,
  onOpenChange,
}: {
  applicationId: string;
  rejectionDetail: RejectionDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const isEditing = !!rejectionDetail;

  const rejectionDateStr = rejectionDetail?.rejectionDate
    ? new Date(rejectionDetail.rejectionDate).toISOString().split("T")[0]
    : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      rejectionDate: form.get("rejectionDate") || undefined,
      rejectedAtStage: form.get("rejectedAtStage") || undefined,
      notes: form.get("notes") || undefined,
    };

    try {
      const res = await fetch(`/api/applications/${applicationId}/rejection`, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error?.message || "Failed to save rejection detail.");
        return;
      }

      toast.success(
        isEditing ? "Rejection detail updated." : "Rejection detail saved."
      );
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
            {isEditing ? "Edit Rejection Detail" : "Add Rejection Detail"}
          </DialogTitle>
          <DialogDescription>
            Record the rejection outcome and what stage you reached.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="rejection-date">Rejection date</Label>
              <Input
                id="rejection-date"
                name="rejectionDate"
                type="date"
                defaultValue={rejectionDateStr}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="rejection-stage">Rejected at stage</Label>
              <Input
                id="rejection-stage"
                name="rejectedAtStage"
                required={!isEditing}
                maxLength={100}
                defaultValue={rejectionDetail?.rejectedAtStage ?? ""}
                placeholder="e.g. Interview"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="rejection-notes">Notes</Label>
            <Textarea
              id="rejection-notes"
              name="notes"
              rows={3}
              maxLength={5000}
              defaultValue={rejectionDetail?.notes ?? ""}
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

