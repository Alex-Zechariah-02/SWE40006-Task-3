"use client";

import * as React from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ArchiveButtonProps {
  isArchived: boolean;
  entityLabel: string;
  onConfirm: () => Promise<void>;
}

export function ArchiveButton({
  isArchived,
  entityLabel,
  onConfirm,
}: ArchiveButtonProps) {
  const [pending, setPending] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            {isArchived ? (
              <ArchiveRestore className="mr-1.5 size-4" />
            ) : (
              <Archive className="mr-1.5 size-4" />
            )}
            {isArchived ? "Unarchive" : "Archive"}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isArchived ? "Unarchive" : "Archive"} {entityLabel}?
          </DialogTitle>
          <DialogDescription>
            {isArchived
              ? `This ${entityLabel.toLowerCase()} will be restored to your active list.`
              : `This ${entityLabel.toLowerCase()} will be moved to the archive. You can restore it later.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            variant={isArchived ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending
              ? "..."
              : isArchived
                ? "Unarchive"
                : "Archive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
