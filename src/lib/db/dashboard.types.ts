export interface DashboardData {
  activeApplications: number;
  upcomingInterviews: number;
  followUpsDue: number;
  deadlinesNear: number;
  savedOpportunities: number;
  nextInterview: {
    id: string;
    interviewType: string;
    scheduledAt: string;
    applicationTitle: string;
    companyName: string;
  } | null;
  nearestDeadline: {
    id: string;
    title: string;
    companyName: string;
    deadline: string;
  } | null;
  urgentActionItems: Array<{
    id: string;
    title: string;
    dueAt: string;
    priority: string;
    status: string;
    isOverdue: boolean;
  }>;
  recentActivity: Array<{
    id: string;
    type: "opportunity" | "application";
    title: string;
    detail: string;
    updatedAt: string;
  }>;
  companyWatchlist: Array<{
    id: string;
    name: string;
    activeApplications: number;
    upcomingDeadlines: number;
  }>;
}

