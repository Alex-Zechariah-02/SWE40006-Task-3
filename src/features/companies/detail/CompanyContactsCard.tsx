"use client";

import { CopyButton } from "@/components/shared/CopyButton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { CompanyDetailData } from "./companyDetailTypes";

type Contact = CompanyDetailData["contacts"][number];

type Props = {
  contacts: Contact[];
};

export function CompanyContactsCard({ contacts }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacts ({contacts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <p className="type-small text-muted-foreground">No contacts added.</p>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {contacts.map((c) => (
              <div key={c.id} className="px-4 py-2.5">
                <p className="type-body font-medium">{c.name}</p>
                {c.title && (
                  <p className="type-small text-muted-foreground">{c.title}</p>
                )}
                {c.email && (
                  <div className="flex items-center gap-1.5">
                    <span className="type-small">{c.email}</span>
                    <CopyButton value={c.email} label="email" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
