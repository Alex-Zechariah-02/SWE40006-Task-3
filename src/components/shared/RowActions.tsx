"use client";

import { MoreHorizontal, Pencil, Trash2, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  isDeleting?: boolean;
  label?: string;
}

export function RowActions({
  onEdit,
  onDelete,
  onArchive,
  isDeleting = false,
  label = "Actions",
}: RowActionsProps) {
  const hasDestructive = onDelete || onArchive;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:opacity-0 sm:group-hover/row:opacity-100 sm:data-[popup-open]:opacity-100"
        aria-label={label}
        disabled={isDeleting}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
        )}
        {onEdit && hasDestructive && <DropdownMenuSeparator />}
        {onArchive && (
          <DropdownMenuItem onClick={onArchive}>
            <Archive className="size-4" />
            Archive
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
