import "server-only";

import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const passwordHash = await hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
    },
    select: { id: true, email: true },
  });

  return user;
}
