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

const PRIORITIES = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

interface ApplicationConvertModalProps {
  opportunityId: string;
  opportunityTitle: string;
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicationConvertModal({
  opportunityId,
  companyName,
  open,
  onOpenChange,
}: ApplicationConvertModalProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [tags, setTags] = React.useState<string[]>([]);

  // Reset tags when modal opens
  React.useEffect(() => {
    if (open) {
      setTags([]);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = new FormData(e.currentTarget);

    const body = {
      opportunityId,
      priority: form.get("priority"),
      appliedDate: form.get("appliedDate") || undefined,
      statusNotes: form.get("statusNotes") || undefined,
      tags,
    };

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 409 && data.existingApplicationId) {
        toast.info("Already converted.", {
          description: "Opening existing application.",
        });
        onOpenChange(false);
        router.push(`/app/applications/${data.existingApplicationId}`);
        return;
      }

      if (!res.ok) {
        toast.error(data.error?.message || "Failed to convert.");
        return;
      }

      toast.success("Converted.");
      onOpenChange(false);
      const newId = data.application?.id as string | undefined;
      if (newId) {
        router.push(`/app/applications/${newId}`);
      } else {
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Convert to Application</DialogTitle>
          <DialogDescription>
            Track this opportunity as an active application for{" "}
            <span className="font-medium text-foreground">{companyName}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="convert-priority">Priority</Label>
            <Select name="priority" defaultValue="Medium" items={PRIORITIES}>
              <SelectTrigger id="convert-priority" className="w-full">
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

          <div className="grid gap-2">
            <Label htmlFor="convert-appliedDate">Date Applied</Label>
            <Input
              id="convert-appliedDate"
              name="appliedDate"
              type="date"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="convert-statusNotes">Status Notes</Label>
            <Textarea
              id="convert-statusNotes"
              name="statusNotes"
              rows={3}
              maxLength={5000}
              placeholder="Any notes about this application..."
            />
          </div>

          <div className="grid gap-2">
            <Label>Tags</Label>
            <TagInput value={tags} onChange={setTags} />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Converting..." : "Convert to Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
