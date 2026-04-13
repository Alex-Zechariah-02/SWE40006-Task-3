export interface OpportunityDetailData {
  id: string;
  title: string;
  opportunityType: string;
  remoteMode: string;
  stage: string;
  sourceType: string;
  sourceUrl: string | null;
  sourceProvider: string;
  location: string | null;
  deadline: string | null;
  snippet: string | null;
  description: string | null;
  notes: string | null;
  tags: string[];
  importedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  company: { id: string; name: string };
  application: {
    id: string;
    currentStage: string;
    priority: string;
    appliedDate: string | null;
  } | null;
}

