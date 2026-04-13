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
  DialogClose,
} from "@/components/ui/dialog";
import type { ActionItemModalProps } from "./modal/types";
import { PRIORITIES, STATUSES } from "./modal/constants";
import { ActionItemLinkFields } from "./modal/ActionItemLinkFields";
import { readActionItemModalError } from "./modal/readError";

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
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  const dueDateStr =
    mode === "edit" && existingItem?.dueAt
      ? new Date(existingItem.dueAt).toISOString().split("T")[0]
      : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors({});

    const form = new FormData(e.currentTarget);

    function readOptionalLinkId(fieldName: string, prelinkedId?: string) {
      const value = form.get(fieldName);
      if (value === null) return prelinkedId || undefined;
      if (typeof value !== "string") return prelinkedId || undefined;
      if (value === "") return undefined;
      return value;
    }

    async function readError(res: Response, fallback: string) {
      return readActionItemModalError({
        res,
        fallback,
        onFields: (fields) => setErrors(fields),
      });
    }

    try {
      if (mode === "create") {
        const body: Record<string, unknown> = {
          title: form.get("title"),
          description: form.get("description") || undefined,
          dueAt: form.get("dueAt") || undefined,
          priority: form.get("priority"),
          status: form.get("status"),
          companyId: readOptionalLinkId("companyId", prelinkedCompanyId),
          opportunityId: readOptionalLinkId(
            "opportunityId",
            prelinkedOpportunityId
          ),
          applicationId: readOptionalLinkId(
            "applicationId",
            prelinkedApplicationId
          ),
          interviewId: readOptionalLinkId("interviewId", prelinkedInterviewId),
        };

        const res = await fetch("/api/actions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          toast.error(await readError(res, "Failed to create."));
          return;
        }

        toast.success("Created.");
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
          toast.error(await readError(res, "Failed to update."));
          return;
        }

        toast.success("Updated.");
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
          <div className="grid gap-2">
            <Label htmlFor="ai-title" required>Title</Label>
            <Input
              id="ai-title"
              name="title"
              required
              aria-describedby="ai-title-error"
              maxLength={200}
              defaultValue={existingItem?.title ?? ""}
              placeholder="e.g. Follow up on application status"
            />
            <FormMessage id="ai-title-error" error>{errors.title?.[0]}</FormMessage>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ai-desc">Description</Label>
            <Textarea
              id="ai-desc"
              name="description"
              rows={3}
              aria-describedby="ai-desc-error"
              maxLength={5000}
              defaultValue={existingItem?.description ?? ""}
              placeholder="Optional details about this action item..."
            />
            <FormMessage id="ai-desc-error" error>{errors.description?.[0]}</FormMessage>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="ai-due">Due date</Label>
              <Input
                id="ai-due"
                name="dueAt"
                type="date"
                aria-describedby="ai-due-error"
                defaultValue={dueDateStr}
              />
              <FormMessage id="ai-due-error" error>{errors.dueAt?.[0]}</FormMessage>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ai-priority">Priority</Label>
              <Select
                name="priority"
                defaultValue={existingItem?.priority ?? "Medium"}
                items={PRIORITIES}
              >
                <SelectTrigger id="ai-priority" className="w-full" aria-describedby="ai-priority-error">
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
              <FormMessage id="ai-priority-error" error>{errors.priority?.[0]}</FormMessage>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ai-status">Status</Label>
              <Select
                name="status"
                defaultValue={existingItem?.status ?? "Open"}
                items={STATUSES}
              >
                <SelectTrigger id="ai-status" className="w-full" aria-describedby="ai-status-error">
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
              <FormMessage id="ai-status-error" error>{errors.status?.[0]}</FormMessage>
            </div>
          </div>

          <ActionItemLinkFields
            companies={companies}
            opportunities={opportunities}
            applications={applications}
            interviews={interviews}
            prelinkedCompanyId={prelinkedCompanyId}
            prelinkedOpportunityId={prelinkedOpportunityId}
            prelinkedApplicationId={prelinkedApplicationId}
            prelinkedInterviewId={prelinkedInterviewId}
          />

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
