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

const STATUSES = [
  { value: "Open", label: "Open" },
  { value: "InProgress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

const PRIORITIES = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

interface EntityOption {
  id: string;
  label: string;
}

interface ActionItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  existingItem?: {
    id: string;
    title: string;
    description: string | null;
    dueAt: string | null;
    priority: string;
    status: string;
  };
  companies?: EntityOption[];
  opportunities?: EntityOption[];
  applications?: EntityOption[];
  interviews?: EntityOption[];
  prelinkedOpportunityId?: string;
  prelinkedApplicationId?: string;
  prelinkedInterviewId?: string;
  prelinkedCompanyId?: string;
}

export function ActionItemModal({
  open,
  onOpenChange,
  mode,
  existingItem,
  companies = [],
  opportunities = [],
  applications = [],
  interviews = [],
  prelinkedOpportunityId,
  prelinkedApplicationId,
  prelinkedInterviewId,
  prelinkedCompanyId,
}: ActionItemModalProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const dueDateStr =
    mode === "edit" && existingItem?.dueAt
      ? new Date(existingItem.dueAt).toISOString().split("T")[0]
      : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = new FormData(e.currentTarget);

    try {
      if (mode === "create") {
        const body: Record<string, unknown> = {
          title: form.get("title"),
          description: form.get("description") || undefined,
          dueAt: form.get("dueAt") || undefined,
          priority: form.get("priority"),
          status: form.get("status"),
          companyId:
            form.get("companyId") || prelinkedCompanyId || undefined,
          opportunityId:
            form.get("opportunityId") || prelinkedOpportunityId || undefined,
          applicationId:
            form.get("applicationId") || prelinkedApplicationId || undefined,
          interviewId:
            form.get("interviewId") || prelinkedInterviewId || undefined,
        };

        const res = await fetch("/api/actions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error?.message || "Failed to create action item.");
          return;
        }

        toast.success("Action item created.");
      } else if (mode === "edit" && existingItem) {
        const body: Record<string, unknown> = {
          title: form.get("title"),
          description: form.get("description") || null,
          dueAt: form.get("dueAt") || null,
          priority: form.get("priority"),
          status: form.get("status"),
        };

        const res = await fetch(`/api/actions/${existingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error?.message || "Failed to update action item.");
          return;
        }

        toast.success("Action item updated.");
      }

      onOpenChange(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New Action Item" : "Edit Action Item"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new action item to track a task or follow-up."
              : "Update the details for this action item."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="ai-title">Title</Label>
            <Input
              id="ai-title"
              name="title"
              required
              maxLength={200}
              defaultValue={existingItem?.title ?? ""}
              placeholder="e.g. Follow up on application status"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="ai-desc">Description</Label>
            <Textarea
              id="ai-desc"
              name="description"
              rows={3}
              maxLength={5000}
              defaultValue={existingItem?.description ?? ""}
              placeholder="Optional details about this action item..."
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ai-due">Due date</Label>
              <Input
                id="ai-due"
                name="dueAt"
                type="date"
                defaultValue={dueDateStr}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Priority</Label>
              <Select
                name="priority"
                defaultValue={existingItem?.priority ?? "Medium"}
              >
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
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                name="status"
                defaultValue={existingItem?.status ?? "Open"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional entity linkages */}
          {(companies.length > 0 || prelinkedCompanyId) && (
            <div className="grid gap-1.5">
              <Label>Company</Label>
              <Select
                name="companyId"
                defaultValue={prelinkedCompanyId ?? ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Link a company (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(opportunities.length > 0 || prelinkedOpportunityId) && (
            <div className="grid gap-1.5">
              <Label>Opportunity</Label>
              <Select
                name="opportunityId"
                defaultValue={prelinkedOpportunityId ?? ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Link an opportunity (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {opportunities.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(applications.length > 0 || prelinkedApplicationId) && (
            <div className="grid gap-1.5">
              <Label>Application</Label>
              <Select
                name="applicationId"
                defaultValue={prelinkedApplicationId ?? ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Link an application (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {applications.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(interviews.length > 0 || prelinkedInterviewId) && (
            <div className="grid gap-1.5">
              <Label>Interview</Label>
              <Select
                name="interviewId"
                defaultValue={prelinkedInterviewId ?? ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Link an interview (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {interviews.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" type="button" />
              }
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create Action Item"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
