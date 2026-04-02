import { AppShell } from "@/components/shared/AppShell";
import { TopNav } from "@/components/shared/TopNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell nav={<TopNav variant="public" />}>{children}</AppShell>;
}
