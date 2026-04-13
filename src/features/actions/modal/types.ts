import type { EntityOption } from "../types";

export interface ActionItemModalProps {
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

