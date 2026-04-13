import { AppShell } from "@/components/shared/AppShell";
import { TopNav } from "@/components/shared/TopNav";
import { getSessionOrRedirect } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionOrRedirect("/app");
  const userName = session.user?.name ?? "Account";
  const userEmail = session.user?.email ?? null;

  return (
    <AppShell
      nav={<TopNav variant="app" userLabel={userName} userEmail={userEmail} />}
    >
      {children}
    </AppShell>
  );
}
