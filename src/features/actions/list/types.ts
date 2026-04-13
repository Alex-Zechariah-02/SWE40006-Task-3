import type { EntityOption } from "../types";

export type BadgeVariant = "default" | "destructive" | "secondary" | "outline" | "success" | "warning";

export interface ActionItemRow {
  id: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  createdAt: string;
  priority: string;
  status: string;
  suggestedBySystem: boolean;
  company: { id: string; name: string } | null;
  opportunity: { id: string; title: string } | null;
  application: { id: string } | null;
  interview: { id: string; interviewType: string } | null;
}

export interface ActionItemLinkOptions {
  companies?: EntityOption[];
  opportunities?: EntityOption[];
  applications?: EntityOption[];
  interviews?: EntityOption[];
}

export interface ActionItemListSurfaceProps {
  actionItems: ActionItemRow[];
  linkOptions?: ActionItemLinkOptions;
}

export type FilterKey =
  | "status"
  | "priority"
  | "companyId"
  | "opportunityId"
  | "applicationId"
  | "interviewId"
  | "linkedType"
  | "dueWindow";

export type SortKey = "newest" | "dueDate" | "priority";

export type ViewMode = "list" | "cards";
