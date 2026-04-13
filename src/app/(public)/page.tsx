import { redirect } from "next/navigation";
import { LandingSearch } from "@/components/public/LandingSearch";
import { PageContainer } from "@/components/shared/PageContainer";
import { auth } from "../../../auth";

export const dynamic = "force-dynamic";

const BENEFITS = [
  {
    label: "DISCOVER",
    description:
      "Search internships, graduate programs, and early-career roles from across the web.",
  },
  {
    label: "TRACK",
    description:
      "Manage applications, interviews, and action items in one structured workspace.",
  },
  {
    label: "PROGRESS",
    description:
      "Turn opportunities into offers. Stay organized from first contact to offer stage.",
  },
];

export default async function Page() {
  const session = await auth();
  const hasIdentity = Boolean(session?.user?.email || session?.user?.name);

  if (hasIdentity) {
    redirect("/app");
  }

  return (
    <PageContainer width="default" className="animate-enter py-0">
      {/* Hero */}
      <section className="space-y-6 py-20 text-center">
        <h1 className="mx-auto type-display-xl font-bold font-display tracking-tight text-balance max-w-2xl">
          Your career pipeline, organized.
        </h1>
        <p className="mx-auto max-w-xl type-emphasis text-muted-foreground text-pretty">
          Track opportunities, manage applications, and stay on top of your job
          search with a structured workspace built for early-career professionals.
        </p>
        <div className="mx-auto max-w-xl">
          <LandingSearch />
        </div>
      </section>

      {/* Benefit summary */}
      <section className="border-t border-border py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BENEFITS.map(({ label, description }) => (
            <div key={label} className="text-center">
              <div className="type-section-label text-primary mb-2">{label}</div>
              <p className="type-body text-muted-foreground text-pretty">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
