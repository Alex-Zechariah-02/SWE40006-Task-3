export interface OpportunityRow {
  id: string;
  title: string;
  opportunityType: string;
  remoteMode: string;
  stage: string;
  sourceType: string;
  location: string | null;
  deadline: string | null;
  tags: string[];
  createdAt: string;
  company: { id: string; name: string };
}

export interface OpportunityListSurfaceProps {
  opportunities: OpportunityRow[];
}

export type FilterKey =
  | "stage"
  | "sourceType"
  | "opportunityType"
  | "company"
  | "tag"
  | "search";

export type SortKey = "newest" | "deadline" | "company";
