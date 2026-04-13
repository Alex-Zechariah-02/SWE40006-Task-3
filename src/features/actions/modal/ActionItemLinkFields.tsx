"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EntityOption } from "../types";

export function ActionItemLinkFields({
  companies,
  opportunities,
  applications,
  interviews,
  prelinkedCompanyId,
  prelinkedOpportunityId,
  prelinkedApplicationId,
  prelinkedInterviewId,
}: {
  companies: EntityOption[];
  opportunities: EntityOption[];
  applications: EntityOption[];
  interviews: EntityOption[];
  prelinkedOpportunityId?: string;
  prelinkedApplicationId?: string;
  prelinkedInterviewId?: string;
  prelinkedCompanyId?: string;
}) {
  return (
    <>
      {(companies.length > 0 || prelinkedCompanyId) && (
        <div className="grid gap-2">
          <Label htmlFor="link-company">Company</Label>
          <Select
            name="companyId"
            defaultValue={prelinkedCompanyId ?? undefined}
            items={[
              { value: "", label: "None" },
              ...companies.map((c) => ({ value: c.id, label: c.label })),
            ]}
          >
            <SelectTrigger id="link-company" className="w-full">
              <SelectValue placeholder="Link a company (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {(opportunities.length > 0 || prelinkedOpportunityId) && (
        <div className="grid gap-2">
          <Label htmlFor="link-opportunity">Opportunity</Label>
          <Select
            name="opportunityId"
            defaultValue={prelinkedOpportunityId ?? undefined}
            items={[
              { value: "", label: "None" },
              ...opportunities.map((o) => ({ value: o.id, label: o.label })),
            ]}
          >
            <SelectTrigger id="link-opportunity" className="w-full">
              <SelectValue placeholder="Link an opportunity (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {opportunities.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {(applications.length > 0 || prelinkedApplicationId) && (
        <div className="grid gap-2">
          <Label htmlFor="link-application">Application</Label>
          <Select
            name="applicationId"
            defaultValue={prelinkedApplicationId ?? undefined}
            items={[
              { value: "", label: "None" },
              ...applications.map((a) => ({ value: a.id, label: a.label })),
            ]}
          >
            <SelectTrigger id="link-application" className="w-full">
              <SelectValue placeholder="Link an application (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {applications.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {(interviews.length > 0 || prelinkedInterviewId) && (
        <div className="grid gap-2">
          <Label htmlFor="link-interview">Interview</Label>
          <Select
            name="interviewId"
            defaultValue={prelinkedInterviewId ?? undefined}
            items={[
              { value: "", label: "None" },
              ...interviews.map((i) => ({ value: i.id, label: i.label })),
            ]}
          >
            <SelectTrigger id="link-interview" className="w-full">
              <SelectValue placeholder="Link an interview (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {interviews.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
}

