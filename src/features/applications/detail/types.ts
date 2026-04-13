export interface ApplicationDetailData {
  id: string;
  currentStage: string;
  priority: string;
  appliedDate: string | null;
  statusNotes: string | null;
  tags: string[];
  archivedAt: string | null;
  createdAt: string;
  opportunity: { id: string; title: string };
  company: { id: string; name: string };
  interviews: Array<{
    id: string;
    interviewType: string;
    scheduledAt: string;
    locationOrLink: string | null;
    status: string;
    notes: string | null;
  }>;
  contacts: Array<{
    id: string;
    name: string;
    title: string | null;
    email: string | null;
    phone: string | null;
  }>;
  companyContacts: Array<{
    id: string;
    name: string;
    title: string | null;
    email: string | null;
    phone: string | null;
  }>;
  actionItems: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueAt: string | null;
  }>;
  offerDetail: {
    id: string;
    offeredDate: string | null;
    compensationNote: string | null;
    responseDeadline: string | null;
    decisionStatus: string;
    notes: string | null;
  } | null;
  rejectionDetail: {
    id: string;
    rejectionDate: string | null;
    rejectedAtStage: string;
    notes: string | null;
  } | null;
}

