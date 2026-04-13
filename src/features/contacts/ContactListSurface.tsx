"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { RowActions } from "@/components/shared/RowActions";
import {
  reducedMotionTransition,
  staggerContainer,
  staggerItem,
  staggerItemTransition,
} from "@/lib/ui/animations";
import { Users } from "lucide-react";
import { ContactCreateModal } from "./ContactCreateModal";
import { ContactEditModal } from "./ContactEditModal";
import { ContactListFiltersRow } from "./ContactListFiltersRow";

interface ContactRow {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  notes: string | null;
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
  const shouldReduceMotion = useReducedMotion();
  const [companyFilter, setCompanyFilter] = React.useState("all");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<ContactRow | null>(
    null
  );
  const [deleting, setDeleting] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<ContactRow | null>(null);

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
        toast.error("Failed to delete.");
        return;
      }
      toast.success("Deleted.");
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
        <ContactListFiltersRow
          companyFilter={companyFilter}
          onCompanyFilterChange={setCompanyFilter}
          companies={companies}
        />
      )}

      {filtered.length === 0 ? (
        <>
          <EmptyState
            icon={Users}
            title={contacts.length > 0 ? "No matching contacts" : "No contacts yet"}
            description={
              contacts.length > 0
                ? "Try adjusting your filter."
                : "Add contacts to keep track of people you connect with during your job search."
            }
            actionLabel={
              contacts.length > 0
                ? "Clear filters"
                : companies.length > 0
                  ? "Add contact"
                  : "Add a company first"
            }
            onAction={() => {
              if (contacts.length > 0) {
                setCompanyFilter("all");
                return;
              }
              if (companies.length > 0) {
                setCreateOpen(true);
                return;
              }
              router.push("/app/companies");
            }}
          />
          {companies.length > 0 && (
            <ContactCreateModal
              companies={companies}
              open={createOpen}
              onOpenChange={setCreateOpen}
            />
          )}
        </>
      ) : (
        <>
          <motion.div
            className="divide-y divide-border rounded-xl border border-border"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filtered.map((ct) => (
              <motion.div
                key={ct.id}
                variants={staggerItem}
                transition={
                  shouldReduceMotion
                    ? reducedMotionTransition
                    : staggerItemTransition
                }
                className="group/row flex items-start justify-between gap-4 px-4 py-3 transition-colors duration-100 hover:bg-muted/50"
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
                      <LabelValue label="Role" value={ct.title} />
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
                <RowActions
                  onEdit={() => setEditTarget(ct)}
                  onDelete={() => setDeleteTarget(ct)}
                  label={`Actions for ${ct.name}`}
                />
              </motion.div>
            ))}
          </motion.div>
          <p className="px-4 py-2 type-small text-muted-foreground">
            <span className="font-medium text-foreground">{filtered.length}</span>{" "}
            of {contacts.length} contacts
          </p>
        </>
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

      {/* Edit modal */}
      {editTarget && (
        <ContactEditModal
          contact={editTarget}
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
        />
      )}
    </div>
  );
}
