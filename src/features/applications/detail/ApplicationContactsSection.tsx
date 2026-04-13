"use client";

import { CopyButton } from "@/components/shared/CopyButton";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { Link2, Unlink2 } from "lucide-react";

type ContactRow = {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
};

export function ApplicationContactsSection({
  contacts,
  canLinkContact,
  onRequestLink,
  onUnlink,
}: {
  contacts: ContactRow[];
  canLinkContact: boolean;
  onRequestLink: () => void;
  onUnlink: (contactId: string) => Promise<void>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacts ({contacts.length})</CardTitle>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={onRequestLink}
            disabled={!canLinkContact}
          >
            <Link2 className="mr-1.5 size-4" />
            Link Contact
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <p className="type-small text-muted-foreground">No contacts linked.</p>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {contacts.map((contact) => (
              <div key={contact.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <dl className="min-w-0 flex-1 space-y-2">
                    <dd className="type-body font-medium">{contact.name}</dd>
                    {contact.title && (
                      <div>
                        <dt className="type-caption font-medium text-muted-foreground">Title</dt>
                        <dd className="mt-1 type-small">{contact.title}</dd>
                      </div>
                    )}
                    {contact.email && (
                      <div>
                        <dt className="type-caption font-medium text-muted-foreground">Email</dt>
                        <dd className="mt-1 flex items-center gap-1.5">
                          <span className="type-small">{contact.email}</span>
                          <CopyButton value={contact.email} label="email" />
                        </dd>
                      </div>
                    )}
                    {contact.phone && (
                      <div>
                        <dt className="type-caption font-medium text-muted-foreground">Phone</dt>
                        <dd className="mt-1 flex items-center gap-1.5">
                          <span className="type-small">{contact.phone}</span>
                          <CopyButton value={contact.phone} label="phone" />
                        </dd>
                      </div>
                    )}
                  </dl>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    onClick={() => void onUnlink(contact.id)}
                    aria-label="Unlink contact"
                  >
                    <Unlink2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
