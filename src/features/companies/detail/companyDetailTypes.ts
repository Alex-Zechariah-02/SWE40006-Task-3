export interface CompanyDetailData {
  id: string;
  name: string;
  website: string | null;
  location: string | null;
  industry: string | null;
  techStackNotes: string | null;
  applicationProcessNotes: string | null;
  interviewNotes: string | null;
  compensationNotes: string | null;
  generalNotes: string | null;
  archivedAt: string | null;
  contacts: Array<{
    id: string;
    name: string;
    title: string | null;
    email: string | null;
  }>;
  applications: Array<{
    id: string;
    currentStage: string;
    priority: string;
    appliedDate: string | null;
    opportunity: {
      id: string;
      title: string;
    };
  }>;
  opportunities: Array<{
    id: string;
    title: string;
    stage: string;
    opportunityType: string;
  }>;
  _count: { applications: number };
}

export const NOTE_FIELDS = [
  { key: "techStackNotes", label: "Tech Stack" },
  { key: "applicationProcessNotes", label: "Application Process" },
  { key: "interviewNotes", label: "Interview" },
  { key: "compensationNotes", label: "Compensation" },
  { key: "generalNotes", label: "General" },
] as const;

export type CompanyNoteFieldKey = (typeof NOTE_FIELDS)[number]["key"];

