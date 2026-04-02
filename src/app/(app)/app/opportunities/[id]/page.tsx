type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold leading-tight">Opportunity</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">ID: {id}</p>
    </main>
  );
}

