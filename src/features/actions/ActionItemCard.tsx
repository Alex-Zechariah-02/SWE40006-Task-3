"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Flag,
  MoreVertical,
  Building2,
  Lightbulb,
  FileText,
  Users,
  Pencil,
  Trash2,
} from "lucide-react";

const PRIORITY_CONFIG: Record<
  string,
  { label: string; variant: "default" | "destructive" | "secondary" | "outline" }
> = {
  High: { label: "High", variant: "destructive" },
  Medium: { label: "Medium", variant: "default" },
  Low: { label: "Low", variant: "secondary" },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "destructive" | "secondary" | "outline" }
> = {
  Open: { label: "Open", variant: "outline" },
  InProgress: { label: "In Progress", variant: "default" },
  Completed: { label: "Completed", variant: "secondary" },
  Cancelled: { label: "Cancelled", variant: "outline" },
};

interface ActionItemCardData {
  id: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  priority: string;
  status: string;
  suggestedBySystem: boolean;
  company: { id: string; name: string } | null;
  opportunity: { id: string; title: string } | null;
  application: { id: string } | null;
  interview: { id: string; interviewType: string } | null;
}

interface ActionItemCardProps {
  item: ActionItemCardData;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function ActionItemCard({
  item,
  onEdit,
  onDelete,
  isDeleting = false,
}: ActionItemCardProps) {
  const priorityCfg = PRIORITY_CONFIG[item.priority] ?? {
    label: item.priority,
    variant: "outline",
  };
  const statusCfg = STATUS_CONFIG[item.status] ?? {
    label: item.status,
    variant: "outline",
  };

  return (
    <Card className="group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex-1">
            <span className="type-body font-medium text-foreground">
              {item.title}
            </span>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                  aria-label={`More actions for ${item.title}`}
                  title="More actions"
                >
                  <MoreVertical className="size-3.5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit} disabled={isDeleting}>
                <Pencil className="mr-1.5 size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-1.5 size-3.5" />
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        {item.description && (
          <p className="type-small text-muted-foreground line-clamp-2 mb-2">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Badge variant={priorityCfg.variant} className="type-small gap-1">
            <Flag className="size-3" />
            {priorityCfg.label}
          </Badge>
          <Badge variant={statusCfg.variant} className="type-small">
            {statusCfg.label}
          </Badge>
          {item.dueAt && (
            <span className="inline-flex items-center gap-1 type-small text-muted-foreground">
              <Calendar className="size-3" />
              {new Date(item.dueAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Entity linkages */}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {item.company && (
            <Link
              href={`/app/companies/${item.company.id}`}
              className="inline-flex items-center gap-1 type-small text-muted-foreground hover:text-foreground transition-colors"
            >
              <Building2 className="size-3" />
              {item.company.name}
            </Link>
          )}
          {item.opportunity && (
            <Link
              href={`/app/opportunities/${item.opportunity.id}`}
              className="inline-flex items-center gap-1 type-small text-muted-foreground hover:text-foreground transition-colors"
            >
              <Lightbulb className="size-3" />
              {item.opportunity.title}
            </Link>
          )}
          {item.application && (
            <Link
              href={`/app/applications/${item.application.id}`}
              className="inline-flex items-center gap-1 type-small text-muted-foreground hover:text-foreground transition-colors"
            >
              <FileText className="size-3" />
              Application
            </Link>
          )}
          {item.interview && (
            <span className="inline-flex items-center gap-1 type-small text-muted-foreground">
              <Users className="size-3" />
              {item.interview.interviewType}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {item.suggestedBySystem && (
          <span className="type-mono-label text-muted-foreground/60">
            System-suggested
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
