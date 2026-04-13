export const INTERVIEW_TYPE_ITEMS = [
  { value: "RecruiterScreen", label: "Recruiter Screen" },
  { value: "HRScreen", label: "HR Screen" },
  { value: "AssessmentReview", label: "Assessment Review" },
  { value: "TechnicalInterview", label: "Technical Interview" },
  { value: "FinalInterview", label: "Final Interview" },
  { value: "OfferDiscussion", label: "Offer Discussion" },
] as const;

export const INTERVIEW_STATUS_ITEMS = [
  { value: "Scheduled", label: "Scheduled" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "NoShow", label: "No Show" },
] as const;

const interviewTypeLabelByValue = Object.fromEntries(
  INTERVIEW_TYPE_ITEMS.map((t) => [t.value, t.label])
) as Record<string, string>;

const interviewStatusLabelByValue = Object.fromEntries(
  INTERVIEW_STATUS_ITEMS.map((s) => [s.value, s.label])
) as Record<string, string>;

export function getInterviewTypeLabel(value: string | null | undefined) {
  if (!value) return "";
  return interviewTypeLabelByValue[value] ?? value;
}

export function getInterviewStatusLabel(value: string | null | undefined) {
  if (!value) return "";
  return interviewStatusLabelByValue[value] ?? value;
}
