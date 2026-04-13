import type { ActionItemPriority, ApplicationStage } from "@prisma/client";

export interface ApplicationFilters {
  currentStage?: ApplicationStage;
  companyId?: string;
  priority?: ActionItemPriority;
  tag?: string;
  includeArchived?: boolean;
  activeOnly?: boolean;
  sort?: "newest" | "priority" | "company";
}

