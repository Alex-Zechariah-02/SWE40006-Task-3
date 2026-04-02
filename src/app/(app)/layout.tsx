import { AppShell } from "@/components/shared/AppShell";
import { TopNav } from "@/components/shared/TopNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell nav={<TopNav variant="app" />}>{children}</AppShell>;
}
