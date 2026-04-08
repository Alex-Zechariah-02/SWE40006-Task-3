"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ActionItemModal } from "@/features/actions/ActionItemModal";
import { Plus } from "lucide-react";

interface ActionHeaderProps {
  linkOptions: {
    companies?: Array<{ id: string; label: string }>;
    opportunities?: Array<{ id: string; label: string }>;
    applications?: Array<{ id: string; label: string }>;
    interviews?: Array<{ id: string; label: string }>;
  };
}

export function ActionHeader({ linkOptions }: ActionHeaderProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="mr-1.5 size-4" />
        Add Action
      </Button>
      <ActionItemModal
        open={open}
        onOpenChange={setOpen}
        mode="create"
        companies={linkOptions.companies ?? []}
        opportunities={linkOptions.opportunities ?? []}
        applications={linkOptions.applications ?? []}
        interviews={linkOptions.interviews ?? []}
      />
    </>
  );
}
