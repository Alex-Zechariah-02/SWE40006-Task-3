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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function CompanyCreateModal() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors({});

    const form = new FormData(e.currentTarget);

    const body = {
      name: form.get("name") as string,
      website: form.get("website") as string || undefined,
      location: form.get("location") as string || undefined,
      industry: form.get("industry") as string || undefined,
      generalNotes: form.get("generalNotes") as string || undefined,
    };

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.fields) setErrors(data.error.fields);
        toast.error(data.error?.message || "Failed to create company.");
        return;
      }

      toast.success(
        data.created ? "Company created." : "Company already exists."
      );
      setOpen(false);
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
            New Company
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Company</DialogTitle>
          <DialogDescription>
            Add a company to your research list.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="co-name">Name</Label>
            <Input id="co-name" name="name" required maxLength={200} placeholder="e.g. Intel Malaysia" />
            {errors.name && <p className="type-small text-destructive">{errors.name[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="co-industry">Industry</Label>
              <Input id="co-industry" name="industry" maxLength={200} placeholder="e.g. Semiconductors" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="co-location">Location</Label>
              <Input id="co-location" name="location" maxLength={200} placeholder="e.g. Penang" />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="co-website">Website</Label>
            <Input id="co-website" name="website" type="url" placeholder="https://..." />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="co-notes">Notes</Label>
            <Textarea id="co-notes" name="generalNotes" rows={3} maxLength={5000} placeholder="General notes about the company..." />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Create Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
