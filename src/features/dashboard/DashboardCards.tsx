"use client";

import { Briefcase, Calendar, AlertCircle, Clock, Lightbulb } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";

interface DashboardCardsProps {
  activeApplications: number;
  upcomingInterviews: number;
  followUpsDue: number;
  deadlinesNear: number;
  savedOpportunities: number;
}

export function DashboardCards({
  activeApplications,
  upcomingInterviews,
  followUpsDue,
  deadlinesNear,
  savedOpportunities,
}: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <StatCard
        label="Active Applications"
        value={activeApplications}
        icon={Briefcase}
        href="/app/applications?activeOnly=true&includeArchived=false&sort=newest"
        interactive
      />
      <StatCard
        label="Upcoming Interviews"
        value={upcomingInterviews}
        icon={Calendar}
        href="/app/applications?stage=Interview&activeOnly=true&includeArchived=false&sort=newest"
        interactive
      />
      <StatCard
        label="Follow-ups Due"
        value={followUpsDue}
        icon={AlertCircle}
        href="/app/actions?status=openWork&dueWindow=overdue&sort=dueDate"
        interactive
      />
      <StatCard
        label="Deadlines Near"
        value={deadlinesNear}
        icon={Clock}
        href="/app/opportunities?deadlineWindow=near&sort=deadline"
        interactive
      />
      <StatCard
        label="Saved Opportunities"
        value={savedOpportunities}
        icon={Lightbulb}
        href="/app/opportunities?stage=Saved&sort=newest"
        interactive
      />
    </div>
  );
}
