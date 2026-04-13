import RegisterForm from "./RegisterForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = (await searchParams) ?? {};
  const nextRaw = resolved.next;
  const next = typeof nextRaw === "string" ? nextRaw : null;

  return <RegisterForm next={next} />;
}
