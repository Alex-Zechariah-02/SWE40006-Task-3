import { AppShell } from "@/components/shared/AppShell";
import { TopNav } from "@/components/shared/TopNav";
import { auth } from "../../../auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userLabel = session?.user?.name ?? session?.user?.email ?? undefined;
  const isSignedIn = Boolean(session?.user?.email);

  return (
    <AppShell
      nav={
        isSignedIn ? (
          <TopNav variant="app" userLabel={userLabel} />
        ) : (
          <TopNav variant="public" />
        )
      }
    >
      {children}
    </AppShell>
  );
}
