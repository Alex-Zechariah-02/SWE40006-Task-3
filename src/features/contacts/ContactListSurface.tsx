"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { EmptyState } from "@/components/shared/EmptyState";
import { LabelValue } from "@/components/shared/LabelValue";
import { Users, Trash2 } from "lucide-react";
import { ContactCreateModal } from "./ContactCreateModal";

interface ContactRow {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  company: { id: string; name: string };
}

interface ContactListSurfaceProps {
  contacts: ContactRow[];
  companies: Array<{ id: string; name: string }>;
}

export function ContactListSurface({
  contacts,
  companies,
}: ContactListSurfaceProps) {
  const router = useRouter();
  const [companyFilter, setCompanyFilter] = React.useState("all");
  const [deleteTarget, setDeleteTarget] = React.useState<ContactRow | null>(
    null
  );
  const [deleting, setDeleting] = React.useState(false);

  const filtered =
    companyFilter === "all"
      ? contacts
      : contacts.filter((c) => c.company.id === companyFilter);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/contacts/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to delete contact.");
        return;
      }
      toast.success("Contact deleted.");
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      {/* Filter */}
      {companies.length > 1 && (
        <div className="flex items-center gap-2 pb-4">
          <Select value={companyFilter} onValueChange={(v) => setCompanyFilter(v ?? "all")}>
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All companies</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts found"
          description={
            contacts.length > 0
              ? "Try adjusting your filter."
              : "Add contacts to track people at your target companies."
          }
          action={
            companies.length > 0 ? (
              <ContactCreateModal companies={companies} />
            ) : (
              <Link
                href="/app/companies"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Add a company
              </Link>
            )
          }
        />
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {filtered.map((ct) => (
            <div
              key={ct.id}
              className="flex items-start justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <p className="type-body font-medium">{ct.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Link
                    href={`/app/companies/${ct.company.id}`}
                    className="type-small text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {ct.company.name}
                  </Link>
                  {ct.title && (
                    <LabelValue label="ROLE" value={ct.title} />
                  )}
                  {ct.email && (
                    <span className="type-small text-muted-foreground">
                      {ct.email}
                    </span>
                  )}
                  {ct.phone && (
                    <span className="type-small text-muted-foreground">
                      {ct.phone}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDeleteTarget(ct)}
                aria-label={`Delete ${ct.name}`}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
          <p className="px-4 py-2 type-small text-muted-foreground">
            {filtered.length} of {contacts.length} contacts
          </p>
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete contact?</DialogTitle>
            <DialogDescription>
              {deleteTarget?.name} will be permanently removed. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
