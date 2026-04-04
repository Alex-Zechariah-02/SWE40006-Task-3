import "server-only";

import { prisma } from "@/lib/prisma";

export interface ContactFilters {
  companyId?: string;
}

export async function listContacts(
  userId: string,
  filters: ContactFilters = {}
) {
  const where: Record<string, unknown> = {
    company: { userId },
  };

  if (filters.companyId) {
    where.companyId = filters.companyId;
  }

  return prisma.contact.findMany({
    where,
    include: { company: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getContact(id: string, userId: string) {
  return prisma.contact.findFirst({
    where: { id, company: { userId } },
    include: { company: { select: { id: true, name: true } } },
  });
}

export async function createContact(
  userId: string,
  data: {
    companyId: string;
    name: string;
    title?: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    notes?: string;
  }
) {
  // Verify company belongs to user
  const company = await prisma.company.findFirst({
    where: { id: data.companyId, userId },
    select: { id: true },
  });

  if (!company) {
    throw new Error("Company not found or not owned by user.");
  }

  return prisma.contact.create({
    data: {
      companyId: data.companyId,
      name: data.name,
      title: data.title || null,
      email: data.email || null,
      phone: data.phone || null,
      linkedinUrl: data.linkedinUrl || null,
      notes: data.notes || null,
    },
  });
}

export async function updateContact(
  id: string,
  userId: string,
  data: {
    name?: string;
    title?: string | null;
    email?: string | null;
    phone?: string | null;
    linkedinUrl?: string | null;
    notes?: string | null;
  }
) {
  // Verify ownership through company
  const contact = await prisma.contact.findFirst({
    where: { id, company: { userId } },
    select: { id: true },
  });

  if (!contact) {
    throw new Error("Contact not found.");
  }

  const update: Record<string, unknown> = {};

  if (data.name !== undefined) update.name = data.name;
  if (data.title !== undefined) update.title = data.title || null;
  if (data.email !== undefined) update.email = data.email || null;
  if (data.phone !== undefined) update.phone = data.phone || null;
  if (data.linkedinUrl !== undefined) update.linkedinUrl = data.linkedinUrl || null;
  if (data.notes !== undefined) update.notes = data.notes || null;

  return prisma.contact.update({
    where: { id },
    data: update,
  });
}

export async function deleteContact(id: string, userId: string) {
  // Verify ownership through company
  const contact = await prisma.contact.findFirst({
    where: { id, company: { userId } },
    select: { id: true },
  });

  if (!contact) {
    throw new Error("Contact not found.");
  }

  return prisma.contact.delete({ where: { id } });
}
