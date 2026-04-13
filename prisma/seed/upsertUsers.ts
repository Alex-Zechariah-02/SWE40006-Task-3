import type { PrismaClient } from "@prisma/client";
import { compare, hash } from "bcryptjs";

export async function upsertUser(
  prisma: PrismaClient,
  params: { email: string; name: string; password: string }
) {
  const email = params.email;
  const name = params.name;
  const password = params.password;
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, name: true },
  });

  if (!existing) {
    const passwordHash = await hash(password, 10);
    return prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: { id: true, email: true },
    });
  }

  const updates: { name?: string; passwordHash?: string } = {};
  if (existing.name !== name) updates.name = name;

  const ok = await compare(password, existing.passwordHash).catch(() => false);
  if (!ok) {
    updates.passwordHash = await hash(password, 10);
  }

  if (Object.keys(updates).length === 0) {
    return { id: existing.id, email };
  }

  return prisma.user.update({
    where: { email },
    data: updates,
    select: { id: true, email: true },
  });
}

export async function upsertDemoUser(prisma: PrismaClient) {
  return upsertUser(prisma, {
    email: "demo@careerdeck.test",
    name: "Alex Demo",
    password: "Demo123!",
  });
}

export async function upsertBlankUser(prisma: PrismaClient) {
  return upsertUser(prisma, {
    email: "blank@careerdeck.test",
    name: "Alex Blank",
    password: "Blank123!",
  });
}

export async function upsertE2EUser(prisma: PrismaClient) {
  return upsertUser(prisma, {
    email: "e2e@careerdeck.test",
    name: "Alex E2E",
    password: "E2E123!",
  });
}

