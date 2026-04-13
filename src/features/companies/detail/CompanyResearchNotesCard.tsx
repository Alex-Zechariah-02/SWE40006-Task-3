"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Save } from "lucide-react";
import { NOTE_FIELDS, type CompanyNoteFieldKey } from "./companyDetailTypes";

type Props = {
  notes: Record<CompanyNoteFieldKey, string>;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onChangeNote: (key: CompanyNoteFieldKey, value: string) => void;
};

export function CompanyResearchNotesCard({
  notes,
  dirty,
  saving,
  onSave,
  onChangeNote,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Research Notes</CardTitle>
        {dirty && (
          <CardAction>
            <Button size="sm" onClick={onSave} disabled={saving}>
              <Save className="mr-1.5 size-4" />
              {saving ? "Saving..." : "Save Notes"}
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {NOTE_FIELDS.map((f) => (
            <div key={f.key} className="grid gap-2">
              <label className="type-caption font-medium text-muted-foreground">
                {f.label}
              </label>
              <Textarea
                rows={3}
                value={notes[f.key]}
                onChange={(e) => onChangeNote(f.key, e.target.value)}
                placeholder={`${f.label} notes...`}
                maxLength={5000}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
