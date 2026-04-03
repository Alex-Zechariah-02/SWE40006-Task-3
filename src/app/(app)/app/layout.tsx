import { AppShell } from "@/components/shared/AppShell";
import { TopNav } from "@/components/shared/TopNav";
import { getSessionOrRedirect } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionOrRedirect("/app");
  const userLabel = session.user?.name ?? session.user?.email ?? "Account";

  return (
    <AppShell nav={<TopNav variant="app" userLabel={userLabel} />}>
      {children}
    </AppShell>
  );
}

