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
import { Plus } from "lucide-react";

interface CompanyOption {
  id: string;
  name: string;
}

interface ContactCreateModalProps {
  companies: CompanyOption[];
  defaultCompanyId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ContactCreateModal({
  companies,
  defaultCompanyId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ContactCreateModalProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled
    ? (controlledOnOpenChange ?? (() => {}))
    : setInternalOpen;
  const [pending, setPending] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors({});

    const form = new FormData(e.currentTarget);

    const body = {
      companyId: form.get("companyId") as string,
      name: form.get("name") as string,
      title: form.get("title") as string || undefined,
      email: form.get("email") as string || undefined,
      phone: form.get("phone") as string || undefined,
      linkedinUrl: form.get("linkedinUrl") as string || undefined,
      notes: form.get("notes") as string || undefined,
    };

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.fields) setErrors(data.error.fields);
        toast.error(data.error?.message || "Failed to create.");
        return;
      }

      toast.success("Created.");
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger
          render={
            <Button size="sm">
              <Plus className="mr-1.5 size-4" />
              New Contact
            </Button>
          }
        />
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Contact</DialogTitle>
          <DialogDescription>
            Add a person at one of your tracked companies.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ct-company" required>Company</Label>
            <Select
              name="companyId"
              required
              defaultValue={defaultCompanyId}
              items={companies.map((c) => ({ value: c.id, label: c.name }))}
            >
              <SelectTrigger id="ct-company" className="w-full" aria-describedby="ct-company-error">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {companies.length === 0 && (
              <p className="type-small text-muted-foreground">
                Add a company first before creating contacts.
              </p>
            )}
            <FormMessage id="ct-company-error" error>{errors.companyId?.[0]}</FormMessage>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ct-name" required>Name</Label>
            <Input id="ct-name" name="name" required aria-describedby="ct-name-error" maxLength={100} placeholder="e.g. Jane Smith" />
            <FormMessage id="ct-name-error" error>{errors.name?.[0]}</FormMessage>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ct-title">Title</Label>
              <Input id="ct-title" name="title" maxLength={200} placeholder="e.g. Recruiter" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ct-email">Email</Label>
              <Input id="ct-email" name="email" type="email" placeholder="jane@company.com" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ct-phone">Phone</Label>
              <Input id="ct-phone" name="phone" maxLength={40} placeholder="+60..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ct-linkedin">LinkedIn</Label>
              <Input id="ct-linkedin" name="linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ct-notes">Notes</Label>
            <Textarea id="ct-notes" name="notes" rows={2} maxLength={5000} placeholder="Notes about this person..." />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={pending || companies.length === 0}
            >
              {pending ? "Saving..." : "Create Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
