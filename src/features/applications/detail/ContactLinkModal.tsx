"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ContactLinkModal({
  open,
  onOpenChange,
  contacts,
  onLink,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Array<{
    id: string;
    name: string;
    title: string | null;
    email: string | null;
    phone: string | null;
  }>;
  onLink: (contactId: string) => Promise<void>;
}) {
  const [contactId, setContactId] = React.useState<string>("");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (open) setContactId("");
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactId) return;
    setPending(true);
    try {
      await onLink(contactId);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Link contact</DialogTitle>
          <DialogDescription>
            Link a company contact to this application.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Contact</Label>
            <Select
              value={contactId}
              onValueChange={(v) => setContactId(v ?? "")}
              items={contacts.map((c) => ({
                value: c.id,
                label: `${c.name}${c.title ? ` • ${c.title}` : ""}`,
              }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a contact..." />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.title ? ` • ${c.title}` : ""}
                    {c.email ? ` • ${c.email}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!contactId || pending}>
              {pending ? "Linking..." : "Link contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

