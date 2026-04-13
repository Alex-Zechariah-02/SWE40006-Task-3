"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { TagInput } from "@/components/app/TagInput";
import { Plus } from "lucide-react";

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

export function OpportunityCreateModal() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [tags, setTags] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors({});

    const form = new FormData(e.currentTarget);

    const body = {
      title: form.get("title") as string,
      companyName: form.get("companyName") as string,
      opportunityType: form.get("opportunityType") as string,
      remoteMode: form.get("remoteMode") as string,
      location: form.get("location") as string || undefined,
      sourceUrl: form.get("sourceUrl") as string || undefined,
      deadline: form.get("deadline") as string || undefined,
      snippet: form.get("snippet") as string || undefined,
      notes: form.get("notes") as string || undefined,
      tags,
    };

    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.fields) {
          setErrors(data.error.fields);
        }
        toast.error(data.error?.message || "Failed to create.");
        return;
      }

      toast.success(data.created ? "Created." : "Already exists.");
      setOpen(false);
      setTags([]);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="mr-1.5 size-4" />
            New Opportunity
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Opportunity</DialogTitle>
          <DialogDescription>
            Add a role you found outside of search.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="opp-title" required>Title</Label>
            <Input id="opp-title" name="title" required aria-describedby="opp-title-error" maxLength={200} placeholder="e.g. Software Engineering Intern" />
            <FormMessage id="opp-title-error" error>{errors.title?.[0]}</FormMessage>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="opp-company" required>Company</Label>
            <Input id="opp-company" name="companyName" required aria-describedby="opp-company-error" maxLength={200} placeholder="e.g. Intel" />
            <FormMessage id="opp-company-error" error>{errors.companyName?.[0]}</FormMessage>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="opp-type" required>Type</Label>
              <Select name="opportunityType" required items={OPPORTUNITY_TYPES}>
                <SelectTrigger id="opp-type" className="w-full" aria-describedby="opp-type-error">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {OPPORTUNITY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage id="opp-type-error" error>{errors.opportunityType?.[0]}</FormMessage>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="opp-mode" required>Work mode</Label>
              <Select name="remoteMode" required items={REMOTE_MODES}>
                <SelectTrigger id="opp-mode" className="w-full" aria-describedby="opp-mode-error">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {REMOTE_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage id="opp-mode-error" error>{errors.remoteMode?.[0]}</FormMessage>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="opp-location">Location</Label>
              <Input id="opp-location" name="location" maxLength={200} placeholder="e.g. Penang" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="opp-deadline">Deadline</Label>
              <Input id="opp-deadline" name="deadline" type="date" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="opp-url">Source URL</Label>
            <Input id="opp-url" name="sourceUrl" type="url" placeholder="https://..." />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="opp-snippet">Snippet</Label>
            <Textarea id="opp-snippet" name="snippet" rows={2} maxLength={2000} placeholder="Brief description..." />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="opp-notes">Notes</Label>
            <Textarea id="opp-notes" name="notes" rows={2} maxLength={5000} placeholder="Your notes..." />
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
              {pending ? "Saving..." : "Create Opportunity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
