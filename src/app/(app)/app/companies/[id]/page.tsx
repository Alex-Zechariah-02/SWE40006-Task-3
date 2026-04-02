import { PageHeader } from "@/components/shared/PageHeader";
import { LabelValue } from "@/components/shared/LabelValue";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <PageHeader title="Company" />
      <LabelValue label="ID" value={id} />
    </div>
  );
}
