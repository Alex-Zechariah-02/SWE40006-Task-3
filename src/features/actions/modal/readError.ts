export async function readActionItemModalError(params: {
  res: Response;
  fallback: string;
  onFields: (fields: Record<string, string[]>) => void;
}): Promise<string> {
  try {
    const data = await params.res.clone().json();
    if (data?.error?.fields) params.onFields(data.error.fields);
    if (typeof data?.error?.message === "string") return data.error.message;
  } catch {
    // ignore
  }

  try {
    const text = await params.res.text();
    if (text) return text.slice(0, 200);
  } catch {
    // ignore
  }

  return params.fallback;
}

