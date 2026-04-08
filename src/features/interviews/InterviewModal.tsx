"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const INTERVIEW_TYPES = [
  { value: "RecruiterScreen", label: "Recruiter Screen" },
  { value: "HRScreen", label: "HR Screen" },
  { value: "AssessmentReview", label: "Assessment Review" },
  { value: "TechnicalInterview", label: "Technical Interview" },
  { value: "FinalInterview", label: "Final Interview" },
  { value: "OfferDiscussion", label: "Offer Discussion" },
];

const INTERVIEW_STATUSES = [
  { value: "Scheduled", label: "Scheduled" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "NoShow", label: "No Show" },
];

interface InterviewData {
  id?: string;
  applicationId: string;
  interviewType?: string;
  scheduledAt?: string;
  locationOrLink?: string | null;
  status?: string;
  notes?: string | null;
}

interface InterviewModalProps {
  interview?: InterviewData | null;
  applicationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InterviewModal({
  interview,
  applicationId,
  open,
  onOpenChange,
}: InterviewModalProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const isEditing = !!interview?.id;
  const [interviewType, setInterviewType] = React.useState<string>(
    interview?.interviewType ?? ""
  );
  const [status, setStatus] = React.useState<string>(
    interview?.status ?? "Scheduled"
  );

  // Build datetime string from existing interview
  const scheduledStr = interview?.scheduledAt
    ? (() => {
        const d = new Date(interview.scheduledAt);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      })()
    : "";

  React.useEffect(() => {
    if (!open) return;
    setInterviewType(interview?.interviewType ?? "");
    setStatus(interview?.status ?? "Scheduled");
  }, [open, interview?.interviewType, interview?.status]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = new FormData(e.currentTarget);
    const scheduledAt = form.get("scheduledAt") as string;

    // Convert local datetime to ISO string for the API
    const scheduledIso = scheduledAt
      ? new Date(scheduledAt).toISOString()
      : "";

    const body = {
      applicationId: interview?.applicationId ?? applicationId,
      interviewType,
      scheduledAt: scheduledIso,
      locationOrLink:
        ((form.get("locationOrLink") as string) || "").trim() || undefined,
      status,
      notes: ((form.get("notes") as string) || "").trim() || undefined,
    };

    try {
      let res: Response;

      if (isEditing && interview?.id) {
        res = await fetch(`/api/interviews/${interview.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/interviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error?.message || "Failed to save interview.");
        return;
      }

      toast.success(
        isEditing ? "Interview updated." : "Interview created."
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
            {isEditing ? "Edit Interview" : "Add Interview"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details for this interview."
              : "Record a new interview for this application."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Interview Type</Label>
            <Select
              name="interviewType"
              value={interviewType}
              onValueChange={(v) => setInterviewType(v ?? "")}
            >
              <SelectTrigger className="w-full" aria-label="Interview type">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {INTERVIEW_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="interview-scheduledAt">Date & Time</Label>
            <Input
              id="interview-scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              defaultValue={scheduledStr}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="interview-locationOrLink">Location or Link</Label>
            <Input
              id="interview-locationOrLink"
              name="locationOrLink"
              maxLength={500}
              defaultValue={interview?.locationOrLink ?? ""}
              placeholder="e.g. Zoom link, office address..."
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select
              name="status"
              value={status}
              onValueChange={(v) => setStatus(v ?? "Scheduled")}
            >
              <SelectTrigger className="w-full" aria-label="Interview status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVIEW_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="interview-notes">Notes</Label>
            <Textarea
              id="interview-notes"
              name="notes"
              rows={3}
              maxLength={5000}
              defaultValue={interview?.notes ?? ""}
              placeholder="Preparation notes, follow-ups..."
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Add Interview"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
