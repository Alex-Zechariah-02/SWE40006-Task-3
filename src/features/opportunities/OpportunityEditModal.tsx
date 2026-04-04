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
import { TagInput } from "@/components/app/TagInput";

const OPPORTUNITY_TYPES = [
  { value: "Internship", label: "Internship" },
  { value: "GraduateProgram", label: "Graduate Program" },
  { value: "FullTime", label: "Full-time" },
  { value: "PartTime", label: "Part-time" },
  { value: "Contract", label: "Contract" },
];

const REMOTE_MODES = [
  { value: "OnSite", label: "On-site" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "Remote", label: "Remote" },
];

const STAGES = [
  { value: "Saved", label: "Saved" },
  { value: "Shortlisted", label: "Shortlisted" },
];

interface OpportunityData {
  id: string;
  title: string;
  opportunityType: string;
  remoteMode: string;
  stage: string;
  location: string | null;
  sourceUrl: string | null;
  deadline: string | null;
  snippet: string | null;
  description: string | null;
  notes: string | null;
  tags: string[];
}

interface OpportunityEditModalProps {
  opportunity: OpportunityData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OpportunityEditModal({
  opportunity,
  open,
  onOpenChange,
}: OpportunityEditModalProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [tags, setTags] = React.useState<string[]>(opportunity.tags);

  React.useEffect(() => {
    setTags(opportunity.tags);
  }, [opportunity.tags]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = new FormData(e.currentTarget);

    const body: Record<string, unknown> = {
      title: form.get("title"),
      opportunityType: form.get("opportunityType"),
      remoteMode: form.get("remoteMode"),
      stage: form.get("stage"),
      location: form.get("location") || null,
      sourceUrl: form.get("sourceUrl") || null,
      deadline: form.get("deadline") || null,
      snippet: form.get("snippet") || null,
      description: form.get("description") || null,
      notes: form.get("notes") || null,
      tags,
    };

    try {
      const res = await fetch(`/api/opportunities/${opportunity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error?.message || "Failed to update.");
        return;
      }

      toast.success("Opportunity updated.");
      onOpenChange(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const deadlineStr = opportunity.deadline
    ? new Date(opportunity.deadline).toISOString().split("T")[0]
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Opportunity</DialogTitle>
          <DialogDescription>
            Update the details for this opportunity.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" name="title" required maxLength={200} defaultValue={opportunity.title} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select name="opportunityType" defaultValue={opportunity.opportunityType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPPORTUNITY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Work mode</Label>
              <Select name="remoteMode" defaultValue={opportunity.remoteMode}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REMOTE_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Stage</Label>
              <Select name="stage" defaultValue={opportunity.stage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-location">Location</Label>
              <Input id="edit-location" name="location" maxLength={200} defaultValue={opportunity.location ?? ""} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-deadline">Deadline</Label>
              <Input id="edit-deadline" name="deadline" type="date" defaultValue={deadlineStr} />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="edit-url">Source URL</Label>
            <Input id="edit-url" name="sourceUrl" type="url" defaultValue={opportunity.sourceUrl ?? ""} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="edit-snippet">Snippet</Label>
            <Textarea id="edit-snippet" name="snippet" rows={2} maxLength={2000} defaultValue={opportunity.snippet ?? ""} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea id="edit-desc" name="description" rows={3} maxLength={10000} defaultValue={opportunity.description ?? ""} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" name="notes" rows={2} maxLength={5000} defaultValue={opportunity.notes ?? ""} />
          </div>

          <div className="grid gap-1.5">
            <Label>Tags</Label>
            <TagInput value={tags} onChange={setTags} />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
