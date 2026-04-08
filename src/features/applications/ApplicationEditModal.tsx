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

const STAGES = [
  { value: "Applied", label: "Applied" },
  { value: "Assessment", label: "Assessment" },
  { value: "Interview", label: "Interview" },
  { value: "Offer", label: "Offer" },
  { value: "Rejected", label: "Rejected" },
  { value: "Withdrawn", label: "Withdrawn" },
];

const PRIORITIES = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

interface ApplicationData {
  id: string;
  currentStage: string;
  priority: string;
  appliedDate: string | null;
  statusNotes: string | null;
  tags: string[];
}

interface ApplicationEditModalProps {
  application: ApplicationData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicationEditModal({
  application,
  open,
  onOpenChange,
}: ApplicationEditModalProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [tags, setTags] = React.useState<string[]>(application.tags);

  React.useEffect(() => {
    setTags(application.tags);
  }, [application.tags]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = new FormData(e.currentTarget);

    const body: Record<string, unknown> = {
      currentStage: form.get("currentStage"),
      priority: form.get("priority"),
      appliedDate: form.get("appliedDate") || null,
      statusNotes: form.get("statusNotes") || null,
      tags,
    };

    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error?.message || "Failed to update.");
        return;
      }

      toast.success("Application updated.");
      onOpenChange(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const appliedDateStr = application.appliedDate
    ? new Date(application.appliedDate).toISOString().split("T")[0]
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
          <DialogDescription>
            Update the details for this application.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Stage</Label>
              <Select name="currentStage" defaultValue={application.currentStage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Priority</Label>
              <Select name="priority" defaultValue={application.priority}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="edit-appliedDate">Date Applied</Label>
            <Input
              id="edit-appliedDate"
              name="appliedDate"
              type="date"
              defaultValue={appliedDateStr}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="edit-statusNotes">Status Notes</Label>
            <Textarea
              id="edit-statusNotes"
              name="statusNotes"
              rows={3}
              maxLength={5000}
              defaultValue={application.statusNotes ?? ""}
              placeholder="Notes about this application..."
            />
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
