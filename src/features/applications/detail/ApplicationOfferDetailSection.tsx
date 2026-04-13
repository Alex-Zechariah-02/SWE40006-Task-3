"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { DetailField } from "./DetailField";
import { Pencil, Plus, Trash2 } from "lucide-react";

type OfferDetailRow = {
  id: string;
  offeredDate: string | null;
  compensationNote: string | null;
  responseDeadline: string | null;
  decisionStatus: string;
  notes: string | null;
};

export function ApplicationOfferDetailSection({
  offerDetail,
  onRequestOpen,
  onRemove,
}: {
  offerDetail: OfferDetailRow | null;
  onRequestOpen: () => void;
  onRemove: () => Promise<void>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Offer Detail</CardTitle>
        <CardAction>
          <div className="flex items-center gap-2">
            {offerDetail ? (
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
        {offerDetail ? (
          <dl className="space-y-3">
            <DetailField
              label="Offered"
              value={
                offerDetail.offeredDate
                  ? new Date(offerDetail.offeredDate).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "long", year: "numeric" }
                    )
                  : null
              }
            />
            <DetailField label="Decision" value={offerDetail.decisionStatus} />
            <DetailField
              label="Response deadline"
              value={
                offerDetail.responseDeadline
                  ? new Date(offerDetail.responseDeadline).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "long", year: "numeric" }
                    )
                  : null
              }
            />
            <div>
              <dt className="type-caption font-medium text-muted-foreground">Compensation</dt>
              <dd className="mt-1">
                {offerDetail.compensationNote ? (
                  <p className="type-body text-foreground/90 whitespace-pre-wrap">
                    {offerDetail.compensationNote}
                  </p>
                ) : (
                  <span className="text-muted-foreground">Not specified</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="type-caption font-medium text-muted-foreground">Notes</dt>
              <dd className="mt-1">
                {offerDetail.notes ? (
                  <p className="type-body text-foreground/90 whitespace-pre-wrap">
                    {offerDetail.notes}
                  </p>
                ) : (
                  <span className="text-muted-foreground">Not specified</span>
                )}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="type-body text-muted-foreground">
            Add offer details to record dates, compensation notes, and your
            decision.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
