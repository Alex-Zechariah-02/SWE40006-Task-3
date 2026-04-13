"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function QuickActionsPanel() {
  return (
    <Card size="sm" className="h-full">
      <CardHeader>
        <CardTitle className="type-section-label text-muted-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Link
          href="/app/opportunities"
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "w-full justify-start"
          )}
        >
          <Plus className="mr-2 h-4 w-4" />
          New application
        </Link>
        <Link
          href="/app/actions"
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "w-full justify-start"
          )}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add action item
        </Link>
        <Link
          href="/search"
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "w-full justify-start"
          )}
        >
          <Search className="mr-2 h-4 w-4" />
          Search opportunities
        </Link>
      </CardContent>
    </Card>
  );
}
