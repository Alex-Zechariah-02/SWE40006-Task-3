"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LabelValue } from "@/components/shared/LabelValue";
import { EmptyState } from "@/components/shared/EmptyState";
import { InterviewModal } from "./InterviewModal";
import { Plus, Pencil, Trash2, Calendar, MapPin, Link as LinkIcon } from "lucide-react";
import { getInterviewStatusLabel, getInterviewTypeLabel } from "./interviewLabels";

interface InterviewRow {
  id: string;
  interviewType: string;
  scheduledAt: string;
  locationOrLink: string | null;
  status: string;
  notes: string | null;
}

interface InterviewListProps {
  interviews: InterviewRow[];
  applicationId: string;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Scheduled: "default",
  Completed: "secondary",
  Cancelled: "outline",
  NoShow: "destructive",
};

export function InterviewList({
  interviews,
  applicationId,
}: InterviewListProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingInterview, setEditingInterview] = React.useState<InterviewRow | null>(null);

  function handleEdit(interview: InterviewRow) {
    setEditingInterview(interview);
    setModalOpen(true);
  }

  function handleNew() {
    setEditingInterview(null);
    setModalOpen(true);
  }

  function handleModalClose(open: boolean) {
    setModalOpen(open);
    if (!open) {
      setEditingInterview(null);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/interviews/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Failed to delete.");
      return;
    }
    toast.success("Deleted.");
    router.refresh();
  }

  // Sort interviews by scheduled date (nearest first)
  const sorted = React.useMemo(() => {
    return [...interviews].sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  }, [interviews]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <p className="type-mono-label text-muted-foreground">
          INTERVIEWS ({interviews.length})
        </p>
        <Button variant="outline" size="sm" onClick={handleNew}>
          <Plus className="mr-1.5 size-4" />
          Add Interview
        </Button>
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No interviews yet"
          description="Add an interview to start tracking your schedule."
        />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {sorted.map((interview) => (
            <div
              key={interview.id}
              className="px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="type-body font-medium">
                      {getInterviewTypeLabel(interview.interviewType)}
                    </span>
                    <Badge
                      variant={
                        STATUS_VARIANT[interview.status] ?? "outline"
                      }
                    >
                      {getInterviewStatusLabel(interview.status)}
                    </Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <LabelValue
                      label="When"
                      value={new Date(interview.scheduledAt).toLocaleDateString(
                        "en-GB",
                        {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    />
                    {interview.locationOrLink && (
                      <span className="inline-flex items-center gap-1 type-small text-muted-foreground">
                        {interview.locationOrLink.startsWith("http") ? (
                          <LinkIcon className="size-3" />
                        ) : (
                          <MapPin className="size-3" />
                        )}
                        {interview.locationOrLink.length > 50
                          ? `${interview.locationOrLink.slice(0, 50)}...`
                          : interview.locationOrLink}
                      </span>
                    )}
                  </div>

                  {interview.notes && (
                    <p className="mt-2 type-small text-muted-foreground whitespace-pre-wrap">
                      {interview.notes}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10"
                    onClick={() => handleEdit(interview)}
                    aria-label="Edit interview"
                    title="Edit"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(interview.id)}
                    aria-label="Delete interview"
                    title="Delete"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <InterviewModal
        interview={
          editingInterview
            ? {
                id: editingInterview.id,
                applicationId,
                interviewType: editingInterview.interviewType,
                scheduledAt: editingInterview.scheduledAt,
                locationOrLink: editingInterview.locationOrLink,
                status: editingInterview.status,
                notes: editingInterview.notes,
              }
            : { applicationId }
        }
        applicationId={applicationId}
        open={modalOpen}
        onOpenChange={handleModalClose}
      />
    </div>
  );
}
