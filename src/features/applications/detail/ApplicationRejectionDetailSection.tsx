"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { DetailField } from "./DetailField";
import { Pencil, Plus, Trash2 } from "lucide-react";

type RejectionDetailRow = {
  id: string;
  rejectionDate: string | null;
  rejectedAtStage: string;
  notes: string | null;
};

export function ApplicationRejectionDetailSection({
  rejectionDetail,
  onRequestOpen,
  onRemove,
}: {
  rejectionDetail: RejectionDetailRow | null;
  onRequestOpen: () => void;
  onRemove: () => Promise<void>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rejection Detail</CardTitle>
        <CardAction>
          <div className="flex items-center gap-2">
            {rejectionDetail ? (
              <>
                <Button variant="outline" size="sm" onClick={onRequestOpen}>
                  <Pencil className="mr-1.5 size-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => void onRemove()}>
                  <Trash2 className="mr-1.5 size-4" />
                  Remove
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={onRequestOpen}>
                <Plus className="mr-1.5 size-4" />
                Add
              </Button>
            )}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {rejectionDetail ? (
          <dl className="space-y-3">
            <DetailField
              label="Rejected"
              value={
                rejectionDetail.rejectionDate
                  ? new Date(rejectionDetail.rejectionDate).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "long", year: "numeric" }
                    )
                  : null
              }
            />
            <DetailField label="At stage" value={rejectionDetail.rejectedAtStage} />
            <div>
              <dt className="type-caption font-medium text-muted-foreground">Notes</dt>
              <dd className="mt-1">
                {rejectionDetail.notes ? (
                  <p className="type-body text-foreground/90 whitespace-pre-wrap">
                    {rejectionDetail.notes}
                  </p>
                ) : (
                  <span className="text-muted-foreground">Not specified</span>
                )}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="type-body text-muted-foreground">
            Add rejection details to record what stage you reached and any
            notes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
