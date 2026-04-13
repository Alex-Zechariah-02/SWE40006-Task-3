"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Pencil, Plus, Trash2 } from "lucide-react";

type ActionItemRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueAt: string | null;
};

export function ApplicationActionItemsSection({
  actionItems,
  onRequestCreate,
  onRequestEdit,
  onDelete,
}: {
  actionItems: ActionItemRow[];
  onRequestCreate: () => void;
  onRequestEdit: (item: ActionItemRow) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Action Items ({actionItems.length})</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" onClick={onRequestCreate}>
            <Plus className="mr-1.5 size-4" />
            Add Action
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {actionItems.length === 0 ? (
          <p className="type-small text-muted-foreground">No action items.</p>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {actionItems.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="type-body font-medium">{item.title}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={item.status} />
                    <PriorityBadge priority={item.priority} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => onRequestEdit(item)}
                      aria-label="Edit action item"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={() => void onDelete(item.id)}
                      aria-label="Delete action item"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                {item.description && (
                  <p className="mt-1 type-small text-muted-foreground whitespace-pre-wrap">
                    {item.description}
                  </p>
                )}
                {item.dueAt && (
                  <p className="mt-1 type-small text-muted-foreground">
                    Due:{" "}
                    {new Date(item.dueAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
