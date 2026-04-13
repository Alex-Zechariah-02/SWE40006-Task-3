export interface ApplicationRow {
  id: string;
  currentStage: string;
  priority: string;
  appliedDate: string | null;
  statusNotes: string | null;
  tags: string[];
  archivedAt: string | null;
  createdAt: string;
  opportunity: {
    id: string;
    title: string;
    opportunityType: string;
    deadline: string | null;
  };
  company: { id: string; name: string };
}

export interface ApplicationListSurfaceProps {
  applications: ApplicationRow[];
}

export type FilterKey =
  | "stage"
  | "company"
  | "opportunityType"
  | "priority"
  | "tag"
  | "activeOnly"
  | "includeArchived"
  | "search";

export type SortKey = "newest" | "deadline" | "urgent" | "company";

export const OPPORTUNITY_TYPES = [
  "Internship",
  "GraduateProgram",
  "FullTime",
  "PartTime",
  "Contract",
];

export const OPPORTUNITY_TYPE_LABELS: Record<string, string> = {
  Internship: "Internship",
  GraduateProgram: "Graduate Program",
  FullTime: "Full-time",
  PartTime: "Part-time",
  Contract: "Contract",
};
