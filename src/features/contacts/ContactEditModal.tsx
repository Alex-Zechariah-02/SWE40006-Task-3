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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface ContactData {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  notes: string | null;
}

interface ContactEditModalProps {
  contact: ContactData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactEditModal({
  contact,
  open,
  onOpenChange,
}: ContactEditModalProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors({});

    const form = new FormData(e.currentTarget);

    const body = {
      name: form.get("name") as string,
      title: (form.get("title") as string) || null,
      email: (form.get("email") as string) || null,
      phone: (form.get("phone") as string) || null,
      linkedinUrl: (form.get("linkedinUrl") as string) || null,
      notes: (form.get("notes") as string) || null,
    };

    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.fields) setErrors(data.error.fields);
        toast.error(data.error?.message || "Failed to update.");
        return;
      }

      toast.success("Updated.");
      onOpenChange(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>
            Update the details for this contact.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-ct-name" required>Name</Label>
            <Input
              id="edit-ct-name"
              name="name"
              required
              aria-describedby="edit-ct-name-error"
              maxLength={100}
              defaultValue={contact.name}
              key={contact.id}
            />
            <FormMessage id="edit-ct-name-error" error>{errors.name?.[0]}</FormMessage>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-ct-title">Title</Label>
              <Input
                id="edit-ct-title"
                name="title"
                maxLength={200}
                defaultValue={contact.title ?? ""}
                key={`${contact.id}-title`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-ct-email">Email</Label>
              <Input
                id="edit-ct-email"
                name="email"
                type="email"
                defaultValue={contact.email ?? ""}
                key={`${contact.id}-email`}
              />
              <FormMessage id="edit-ct-email-error" error>{errors.email?.[0]}</FormMessage>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-ct-phone">Phone</Label>
              <Input
                id="edit-ct-phone"
                name="phone"
                maxLength={40}
                defaultValue={contact.phone ?? ""}
                key={`${contact.id}-phone`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-ct-linkedin">LinkedIn</Label>
              <Input
                id="edit-ct-linkedin"
                name="linkedinUrl"
                type="url"
                defaultValue={contact.linkedinUrl ?? ""}
                key={`${contact.id}-linkedin`}
              />
              <FormMessage id="edit-ct-linkedin-error" error>{errors.linkedinUrl?.[0]}</FormMessage>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-ct-notes">Notes</Label>
            <Textarea
              id="edit-ct-notes"
              name="notes"
              rows={2}
              maxLength={5000}
              defaultValue={contact.notes ?? ""}
              key={`${contact.id}-notes`}
            />
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
